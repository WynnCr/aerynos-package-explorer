#!/usr/bin/env node
/**
 * AerynOS Package Index Generator
 *
 * Fetches all package recipes from https://github.com/aerynOS/recipes
 * and generates a static JSON index at static/data/packages.json
 *
 * Usage:
 *   GITHUB_TOKEN=<token> npx tsx scripts/generate-index.ts
 *   npx tsx scripts/generate-index.ts  # (slower, rate-limited to 60 req/hr)
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as parseYaml } from 'js-yaml';

// ============================================================
// Types (inline — script runs standalone)
// ============================================================

export type ChannelType = 'both' | 'volatile' | 'unstable' | 'recipe';

export interface Upstream {
  url: string;
  hash: string;
  type: 'tarball' | 'git';
}

export interface SubPackage {
  name: string;
  summary?: string;
  description?: string;
  rundeps?: string[];
  paths?: string[];
  channel?: ChannelType;
}

export interface Package {
  name: string;
  version: string;
  release: number;
  homepage: string;
  summary: string;
  description: string;
  license: string[];
  upstreams: Upstream[];
  letter: string;
  recipeUrl: string;
  rawUrl: string;
  indexedAt: string;
  category?: string;
  builddeps?: string[];
  rundeps?: string[];
  toolchain?: string;
  emul32?: boolean;
  packages?: SubPackage[];
  setup?: string;
  build?: string;
  install?: string;
  check?: string;
  environment?: string;
  tuning?: string[];
  profiles?: Record<string, unknown>;
  channel?: ChannelType;
}

export interface ChannelStats {
  volatileCount: number;
  unstableCount: number;
  volatileOnlyCount: number;
  bothCount: number;
  recipeOnlyCount: number;
}

export interface PackageIndex {
  packages: Package[];
  generatedAt: string;
  totalCount: number;
  repoUrl: string;
  commitSha?: string | null;
  channelStats?: ChannelStats;
}

// ============================================================
// Config
// ============================================================

const RECIPES_API = 'https://api.github.com/repos/aerynOS/recipes/contents/recipes';
const RAW_BASE = 'https://raw.githubusercontent.com/aerynOS/recipes/main/recipes';
const GITHUB_BLOB_BASE = 'https://github.com/aerynOS/recipes/blob/main/recipes';
const REPO_URL = 'https://github.com/aerynOS/recipes';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const HEADERS: Record<string, string> = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'aerynos-package-explorer/1.0',
};
if (GITHUB_TOKEN) {
  HEADERS['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
}

// ============================================================
// Helpers
// ============================================================

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/**
 * Fetch a URL with retry logic and GitHub rate-limit handling.
 */
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS });

    if (res.status === 429 || res.status === 403) {
      const retryAfterRaw =
        res.headers.get('Retry-After') ?? res.headers.get('X-RateLimit-Reset');
      let waitMs: number;
      if (retryAfterRaw) {
        const parsed = parseInt(retryAfterRaw, 10);
        // X-RateLimit-Reset is a Unix timestamp; Retry-After is seconds
        if (parsed > 1_000_000_000) {
          // Unix timestamp
          waitMs = Math.max(0, parsed * 1000 - Date.now()) + 2000;
        } else {
          waitMs = parsed * 1000;
        }
      } else {
        waitMs = 60_000 * (i + 1);
      }
      console.warn(`Rate limited (${res.status}). Waiting ${Math.round(waitMs / 1000)}s...`);
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      if (i < retries - 1) {
        await sleep(2000 * (i + 1));
        continue;
      }
      throw new Error(`HTTP ${res.status} for ${url}`);
    }

    return res;
  }
  throw new Error(`Failed after ${retries} retries: ${url}`);
}

// ============================================================
// YAML Parser
// ============================================================

/**
 * Parse a stone.yaml content string into a Package object.
 * Returns null on parse failure.
 */
export function parseStoneYaml(
  content: string,
  packageName: string,
  letter: string,
): Package | null {
  try {
    const raw = parseYaml(content) as Record<string, unknown>;
    if (!raw || typeof raw !== 'object') return null;

    // --- license: string | string[] → always string[] ---
    let license: string[] = [];
    if (typeof raw.license === 'string') {
      license = [raw.license];
    } else if (Array.isArray(raw.license)) {
      license = (raw.license as unknown[]).map(String);
    }

    // --- upstreams ---
    const upstreams: Upstream[] = [];
    if (Array.isArray(raw.upstreams)) {
      for (const entry of raw.upstreams as unknown[]) {
        if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
          const entries = Object.entries(entry as Record<string, unknown>);
          if (entries.length > 0) {
            const [url, hash] = entries[0] as [string, unknown];
            const isGit = url.startsWith('git|');
            upstreams.push({
              url: isGit ? url.replace(/^git\|/, '') : url,
              hash: String(hash ?? ''),
              type: isGit ? 'git' : 'tarball',
            });
          }
        }
      }
    }

    // --- sub-packages ---
    const subPackages: SubPackage[] = [];
    if (Array.isArray(raw.packages)) {
      for (const entry of raw.packages as unknown[]) {
        if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
          const entries = Object.entries(entry as Record<string, unknown>);
          if (entries.length > 0) {
            const [pkgName, pkgDef] = entries[0] as [string, Record<string, unknown> | null];
            const resolvedName = pkgName.replace('%(name)', packageName);
            subPackages.push({
              name: resolvedName,
              summary: typeof pkgDef?.summary === 'string' ? pkgDef.summary : undefined,
              description: typeof pkgDef?.description === 'string' ? pkgDef.description : undefined,
              rundeps: Array.isArray(pkgDef?.rundeps)
                ? (pkgDef.rundeps as unknown[]).map(String)
                : undefined,
              paths: Array.isArray(pkgDef?.paths)
                ? (pkgDef.paths as unknown[]).map(String)
                : undefined,
            });
          }
        }
      }
    }

    // --- tuning / tune synonym ---
    const tuningRaw = raw.tuning ?? raw.tune;
    const tuning = Array.isArray(tuningRaw)
      ? (tuningRaw as unknown[]).map(String)
      : typeof tuningRaw === 'string'
        ? [tuningRaw]
        : undefined;

    const name = String(raw.name ?? packageName);

    const pkg: Package = {
      name,
      version: String(raw.version ?? ''),
      release:
        typeof raw.release === 'number'
          ? raw.release
          : parseInt(String(raw.release ?? '0'), 10),
      homepage: String(raw.homepage ?? ''),
      summary: String(raw.summary ?? ''),
      description: String(raw.description ?? '').trim(),
      license,
      upstreams,
      letter,
      recipeUrl: `${GITHUB_BLOB_BASE}/${letter}/${name}/stone.yaml`,
      rawUrl: `${RAW_BASE}/${letter}/${name}/stone.yaml`,
      indexedAt: new Date().toISOString(),
    };

    // Optional fields (only add if present / truthy)
    if (Array.isArray(raw.builddeps) && (raw.builddeps as unknown[]).length > 0) {
      pkg.builddeps = (raw.builddeps as unknown[]).map(String);
    }
    if (Array.isArray(raw.rundeps) && (raw.rundeps as unknown[]).length > 0) {
      pkg.rundeps = (raw.rundeps as unknown[]).map(String);
    }
    if (typeof raw.toolchain === 'string') pkg.toolchain = raw.toolchain;
    if (raw.emul32 === true) pkg.emul32 = true;
    if (subPackages.length > 0) pkg.packages = subPackages;
    if (typeof raw.setup === 'string') pkg.setup = raw.setup;
    if (typeof raw.build === 'string') pkg.build = raw.build;
    if (typeof raw.install === 'string') pkg.install = raw.install;
    if (typeof raw.check === 'string') pkg.check = raw.check;
    if (typeof raw.environment === 'string') pkg.environment = raw.environment;
    if (tuning) pkg.tuning = tuning;
    if (raw.profiles !== undefined && raw.profiles !== null) {
      pkg.profiles = raw.profiles as Record<string, unknown>;
    }

    return pkg;
  } catch (e) {
    console.error(`Error parsing stone.yaml for ${packageName}:`, e);
    return null;
  }
}

// ============================================================
// Category Inference
// ============================================================

/**
 * Infer a human-readable category from package name, summary, and description.
 * Categories match the UI filter list.
 */
export function inferCategory(pkg: Package): string {
  const name = pkg.name.toLowerCase();
  const combined = `${pkg.summary} ${pkg.description}`.toLowerCase();

  // Fonts
  if (
    name.startsWith('font-') ||
    name.includes('noto-') ||
    name.includes('nerd-font') ||
    combined.includes('font') ||
    combined.includes('typeface') ||
    combined.includes('glyph')
  )
    return 'Fonts';

  // Audio / Video / Media
  if (
    name.includes('ffmpeg') ||
    name.includes('gstreamer') ||
    name.includes('pipewire') ||
    name.includes('pulseaudio') ||
    name.includes('alsa') ||
    name.includes('mpv') ||
    name.includes('vlc') ||
    combined.includes('audio') ||
    combined.includes('video') ||
    combined.includes('media player') ||
    combined.includes('codec') ||
    combined.includes('multimedia') ||
    combined.includes('sound')
  )
    return 'Multimedia';

  // Graphics / Images
  if (
    name.includes('mesa') ||
    name.includes('vulkan') ||
    name.includes('opengl') ||
    name.includes('gimp') ||
    name.includes('inkscape') ||
    name.includes('blender') ||
    combined.includes('graphics') ||
    combined.includes('rendering') ||
    combined.includes('opengl') ||
    combined.includes('vulkan') ||
    combined.includes('image processing') ||
    combined.includes('gpu')
  )
    return 'Graphics';

  // Networking / Internet
  if (
    name.includes('curl') ||
    name.includes('wget') ||
    name.includes('firefox') ||
    name.includes('chromium') ||
    name.includes('nginx') ||
    name.includes('openssh') ||
    name.includes('nmap') ||
    combined.includes('network') ||
    combined.includes('http') ||
    combined.includes('ftp') ||
    combined.includes('web browser') ||
    combined.includes('internet') ||
    combined.includes('vpn') ||
    combined.includes('proxy') ||
    combined.includes('dns') ||
    combined.includes('protocol')
  )
    return 'Networking';

  // Security / Cryptography
  if (
    name.includes('gnupg') ||
    name.includes('openssl') ||
    name.includes('ca-certificates') ||
    name.includes('nss') ||
    name.includes('gpg') ||
    name.includes('libsecret') ||
    combined.includes('security') ||
    combined.includes('cryptograph') ||
    combined.includes('ssl') ||
    combined.includes('tls') ||
    combined.includes('certificate') ||
    combined.includes('encryption') ||
    combined.includes('authentication') ||
    combined.includes('password')
  )
    return 'Security';

  // Desktop / GUI / Wayland / X11
  if (
    name.includes('gtk') ||
    name.includes('qt') ||
    name.includes('kde') ||
    name.includes('gnome') ||
    name.includes('wayland') ||
    name.includes('xorg') ||
    name.includes('hypr') ||
    name.includes('sway') ||
    name.includes('wlroots') ||
    combined.includes('wayland') ||
    combined.includes('desktop') ||
    combined.includes('window manager') ||
    combined.includes('compositor') ||
    combined.includes('display server') ||
    combined.includes('x11') ||
    combined.includes('gtk') ||
    combined.includes('qt')
  )
    return 'Desktop';

  // System / Kernel / Low-level
  if (
    name.includes('linux') ||
    name.includes('kernel') ||
    name.includes('systemd') ||
    name.includes('glibc') ||
    name.includes('musl') ||
    name.includes('udev') ||
    name.includes('dbus') ||
    name.includes('busybox') ||
    combined.includes('kernel') ||
    combined.includes('system call') ||
    combined.includes('kernel module') ||
    combined.includes('init system') ||
    combined.includes('bootloader') ||
    combined.includes('firmware')
  )
    return 'System';

  // Programming Languages / Runtimes
  if (
    name === 'go' ||
    name === 'rust' ||
    name === 'python' ||
    name === 'python3' ||
    name === 'ruby' ||
    name === 'nodejs' ||
    name === 'node' ||
    name === 'java' ||
    name === 'perl' ||
    name === 'lua' ||
    name === 'erlang' ||
    name === 'haskell' ||
    name === 'ghc' ||
    name.startsWith('python-') ||
    name.startsWith('python3-') ||
    name.startsWith('perl-') ||
    name.startsWith('ruby-') ||
    combined.includes('programming language') ||
    combined.includes('runtime environment') ||
    combined.includes('interpreter')
  )
    return 'Languages';

  // Development / Build tools / Libraries
  if (
    combined.includes('compiler') ||
    combined.includes('debugger') ||
    combined.includes('build system') ||
    combined.includes('development librar') ||
    combined.includes('development tool') ||
    name.includes('cmake') ||
    name.includes('meson') ||
    name.includes('ninja') ||
    name.includes('gcc') ||
    name.includes('clang') ||
    name.includes('llvm') ||
    name.includes('gdb') ||
    name.includes('valgrind') ||
    name.includes('make') ||
    name.includes('-dev') ||
    name.includes('-devel') ||
    name.endsWith('-libs') ||
    combined.includes('library for') ||
    combined.includes('provides lib') ||
    combined.includes('development files')
  )
    return 'Development';

  // Games
  if (
    name.includes('steam') ||
    name.includes('wine') ||
    name.includes('gamemode') ||
    combined.includes('game') ||
    combined.includes('gaming') ||
    combined.includes('emulator') ||
    combined.includes('arcade')
  )
    return 'Games';

  // Text editors / IDEs
  if (
    name.includes('nano') ||
    name.includes('vim') ||
    name.includes('neovim') ||
    name.includes('emacs') ||
    name.includes('helix') ||
    combined.includes('text editor') ||
    combined.includes('code editor') ||
    combined.includes('integrated development environment')
  )
    return 'Editors';

  // CLI / Utilities
  if (
    combined.includes('command-line') ||
    combined.includes('command line') ||
    combined.includes('cli tool') ||
    combined.includes('utility') ||
    combined.includes('utilities')
  )
    return 'Utilities';

  return 'Other';
}

// ============================================================
// Main Indexer
// ============================================================

async function main(): Promise<void> {
  // Check for local directory option: --local <path> or env RECIPES_DIR or auto-detect
  const args = process.argv.slice(2);
  let localDir: string | undefined;
  const localIdx = args.indexOf('--local');
  if (localIdx !== -1 && args[localIdx + 1]) {
    localDir = args[localIdx + 1];
  } else if (process.env.RECIPES_DIR) {
    localDir = process.env.RECIPES_DIR;
  } else if (existsSync('/home/amrit/Projects/aerynos-recipes')) {
    localDir = '/home/amrit/Projects/aerynos-recipes';
  }

  const packages: Package[] = [];
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = join(__dirname, '..', 'static', 'data', 'packages.json');

  if (localDir && existsSync(localDir)) {
    console.log(`📁 Indexing from local recipes repository: ${localDir}`);
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const startTime = Date.now();

    for (const letter of letters) {
      const letterPath = join(localDir, letter);
      if (!existsSync(letterPath)) continue;

      let entries: string[] = [];
      try {
        entries = readdirSync(letterPath);
      } catch {
        continue;
      }

      for (const entry of entries) {
        const pkgDir = join(letterPath, entry);
        try {
          if (!statSync(pkgDir).isDirectory()) continue;
        } catch {
          continue;
        }

        const stonePath = join(pkgDir, 'stone.yaml');
        if (!existsSync(stonePath)) continue;

        try {
          const content = readFileSync(stonePath, 'utf-8');
          const pkg = parseStoneYaml(content, entry, letter);
          if (pkg) {
            pkg.category = inferCategory(pkg);
            // Fix recipe and raw URLs to real root pattern (no extra recipes/ prefix)
            pkg.recipeUrl = `https://github.com/aerynOS/recipes/blob/main/${letter}/${pkg.name}/stone.yaml`;
            pkg.rawUrl = `https://raw.githubusercontent.com/aerynOS/recipes/main/${letter}/${pkg.name}/stone.yaml`;
            packages.push(pkg);
          }
        } catch (e) {
          console.warn(`  ✗ ${entry}: parse failed`, e);
        }
      }
    }

    packages.sort((a, b) => a.name.localeCompare(b.name));
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✓ Indexed ${packages.length} packages from local recipes in ${elapsed}s.`);
  } else {
    console.log('🔍 Fetching AerynOS recipes via GitHub API...');
    if (!GITHUB_TOKEN) {
      console.warn('⚠️  No GITHUB_TOKEN set. Using unauthenticated rate limit (60 req/hr).');
      console.warn('   Set GITHUB_TOKEN env var for 5000 req/hr.');
    } else {
      console.log('✓  Using GitHub token for authenticated requests (5000 req/hr).');
    }

    // 1. Get letter dirs from GitHub API root
    const rootApi = 'https://api.github.com/repos/aerynOS/recipes/contents';
    const dirRes = await fetchWithRetry(rootApi);
    const dirs = (await dirRes.json()) as Array<{ name: string; type: string; url: string }>;
    const letterDirs = dirs.filter(d => d.type === 'dir' && /^[a-z]$/.test(d.name));
    console.log(`Found ${letterDirs.length} letter directories\n`);

    let errors = 0;

    // 2. For each letter dir, get package dirs
    for (const letterDir of letterDirs) {
      const letter = letterDir.name;
      console.log(`📁 Processing /${letter}...`);

      let pkgDirs: Array<{ name: string; type: string; url: string }>;
      try {
        const pkgRes = await fetchWithRetry(letterDir.url);
        const all = (await pkgRes.json()) as Array<{ name: string; type: string; url: string }>;
        pkgDirs = all.filter(d => d.type === 'dir');
      } catch (e) {
        console.error(`  ✗ Failed to list /${letter}: ${e}`);
        errors++;
        continue;
      }

      // 3. For each package, fetch stone.yaml directly from raw URL
      for (const pkgDir of pkgDirs) {
        const pkgName = pkgDir.name;
        const rawUrl = `https://raw.githubusercontent.com/aerynOS/recipes/main/${letter}/${pkgName}/stone.yaml`;

        try {
          await sleep(GITHUB_TOKEN ? 50 : 500);

          const contentRes = await fetchWithRetry(rawUrl);
          const content = await contentRes.text();

          const pkg = parseStoneYaml(content, pkgName, letter);
          if (pkg) {
            pkg.category = inferCategory(pkg);
            pkg.recipeUrl = `https://github.com/aerynOS/recipes/blob/main/${letter}/${pkg.name}/stone.yaml`;
            pkg.rawUrl = `https://raw.githubusercontent.com/aerynOS/recipes/main/${letter}/${pkg.name}/stone.yaml`;
            packages.push(pkg);
            console.log(`  ✓ ${pkgName} ${pkg.version}-${pkg.release}`);
          } else {
            console.warn(`  ✗ ${pkgName}: parse returned null`);
            errors++;
          }
        } catch (e) {
          console.error(`  ✗ ${pkgName}: ${e}`);
          errors++;
        }
      }
    }

    packages.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Load channel availability metadata if static/data/channels.json exists
  const channelsPath = join(__dirname, '..', 'static', 'data', 'channels.json');
  let vSet = new Set<string>();
  let uSet = new Set<string>();

  if (existsSync(channelsPath)) {
    try {
      const channelsData = JSON.parse(readFileSync(channelsPath, 'utf-8'));
      vSet = new Set(channelsData.volatilePackages || []);
      uSet = new Set(channelsData.unstablePackages || []);
      console.log(`📡 Loaded channel metadata: ${uSet.size} unstable, ${vSet.size} volatile packages.`);
    } catch (e) {
      console.warn('⚠️ Could not parse channels.json:', e);
    }
  } else {
    console.log('ℹ️ static/data/channels.json not found; run scripts/fetch-channels.py to populate.');
  }

  let bothCount = 0;
  let volatileOnlyCount = 0;
  let unstableOnlyCount = 0;
  let recipeOnlyCount = 0;

  for (const pkg of packages) {
    const namesToCheck = [pkg.name];
    if (pkg.packages) {
      for (const sub of pkg.packages) {
        namesToCheck.push(sub.name);
        const inU = uSet.has(sub.name);
        const inV = vSet.has(sub.name);
        sub.channel = inU && inV ? 'both' : (inV ? 'volatile' : (inU ? 'unstable' : 'recipe'));
      }
    }

    let inUnstable = false;
    let inVolatile = false;

    for (const n of namesToCheck) {
      if (uSet.has(n)) inUnstable = true;
      if (vSet.has(n)) inVolatile = true;
    }

    if (inUnstable && inVolatile) {
      pkg.channel = 'both';
      bothCount++;
    } else if (inVolatile) {
      pkg.channel = 'volatile';
      volatileOnlyCount++;
    } else if (inUnstable) {
      pkg.channel = 'unstable';
      unstableOnlyCount++;
    } else {
      pkg.channel = 'recipe';
      recipeOnlyCount++;
    }
  }

  // Write output
  const output: PackageIndex = {
    packages,
    generatedAt: new Date().toISOString(),
    totalCount: packages.length,
    repoUrl: REPO_URL,
    channelStats: {
      volatileCount: vSet.size,
      unstableCount: uSet.size,
      volatileOnlyCount,
      bothCount,
      recipeOnlyCount
    }
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✅ Done!`);
  console.log(`   Indexed : ${packages.length} packages`);
  console.log(`   Channels: ${bothCount} both, ${volatileOnlyCount} volatile-only, ${recipeOnlyCount} recipe-only`);
  console.log(`   Output  : ${outPath}\n`);
}

if (process.argv[1] && (process.argv[1].endsWith('generate-index.ts') || process.argv[1].endsWith('generate-index.js'))) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
