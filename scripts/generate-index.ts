#!/usr/bin/env node
/**
 * AerynOS package index generator.
 *
 * Reads every <letter>/<name>/stone.yaml in aerynOS/recipes and writes
 * static/data/packages.json.
 *
 * Usage:
 *   pnpm generate-index                      # shallow-clones aerynOS/recipes into a temp dir
 *   pnpm generate-index --local path/to/recipes
 *   RECIPES_DIR=path/to/recipes pnpm generate-index
 *   pnpm generate-index --force              # skip the "index shrank" sanity check
 *
 * The output is deterministic: same recipes commit + same channels.json gives
 * byte-identical files, so CI only commits when something real changed.
 */

import { writeFileSync, renameSync, mkdirSync, mkdtempSync, existsSync, readdirSync, statSync, readFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { load as parseYaml } from 'js-yaml';
import type { Package, PackageIndex } from '../src/lib/data/types';

// ============================================================
// Config
// ============================================================

const REPO_URL = 'https://github.com/aerynOS/recipes';
const RAW_BASE = 'https://raw.githubusercontent.com/aerynOS/recipes/main';
const GITHUB_BLOB_BASE = 'https://github.com/aerynOS/recipes/blob/main';

/** Refuse to write if more than this share of recipes fail to parse. */
const MAX_FAILURE_RATE = 0.01;
/** Refuse to write if the new index is smaller than this share of the old one. */
const MIN_SIZE_VS_PREVIOUS = 0.95;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES_PATH = join(ROOT, 'static', 'data', 'packages.json');
const CHANNELS_PATH = join(ROOT, 'static', 'data', 'channels.json');

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

function cmpCodepoint(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function git(cwd: string, ...args: string[]): string | null {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const localIdx = args.indexOf('--local');
  let recipesDir = localIdx !== -1 ? args[localIdx + 1] : process.env.RECIPES_DIR;
  let tempClone: string | undefined;

  if (!recipesDir) {
    tempClone = mkdtempSync(join(tmpdir(), 'aerynos-recipes-'));
    console.log(`Cloning ${REPO_URL} into ${tempClone}`);
    execFileSync('git', ['clone', '--depth', '1', '--quiet', REPO_URL, tempClone], { stdio: 'inherit' });
    recipesDir = tempClone;
  }
  if (!existsSync(recipesDir)) {
    throw new Error(`Recipes directory not found: ${recipesDir}`);
  }

  try {
    run(recipesDir, force);
  } finally {
    if (tempClone) rmSync(tempClone, { recursive: true, force: true });
  }
}

function run(recipesDir: string, force: boolean): void {
  const packages: Package[] = [];
  const failures: string[] = [];

  for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
    const letterPath = join(recipesDir, letter);
    if (!existsSync(letterPath)) continue;

    for (const entry of readdirSync(letterPath)) {
      const stonePath = join(letterPath, entry, 'stone.yaml');
      if (!existsSync(stonePath) || !statSync(join(letterPath, entry)).isDirectory()) continue;
      try {
        const pkg = parseStoneYaml(readFileSync(stonePath, 'utf-8'), entry, letter);
        if (!pkg) throw new Error('parser returned null');
        pkg.category = inferCategory(pkg);
        packages.push(pkg);
      } catch (e) {
        failures.push(`${letter}/${entry}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  // Codepoint order, not localeCompare: the result must not depend on the runner's locale.
  packages.sort((a, b) => cmpCodepoint(a.name, b.name));

  for (const f of failures) console.warn(`  failed ${f}`);
  const attempted = packages.length + failures.length;
  if (failures.length > 0 && failures.length / attempted > MAX_FAILURE_RATE) {
    throw new Error(`${failures.length} of ${attempted} recipes failed to parse; refusing to write the index.`);
  }

  const previous = readJson<PackageIndex>(PACKAGES_PATH);
  if (!force && previous && packages.length < previous.totalCount * MIN_SIZE_VS_PREVIOUS) {
    throw new Error(
      `Index shrank from ${previous.totalCount} to ${packages.length} packages. ` +
      `Looks like a bad checkout; rerun with --force if this is intended.`
    );
  }

  // Which channels each package is in (written by scripts/fetch-channels.py)
  const channels = readJson<{ volatilePackages?: string[]; unstablePackages?: string[] }>(CHANNELS_PATH);
  const vSet = new Set(channels?.volatilePackages ?? []);
  const uSet = new Set(channels?.unstablePackages ?? []);
  if (!channels) console.warn('static/data/channels.json missing or unreadable; every package will be marked recipe-only.');

  const classify = (names: string[]): Package['channel'] => {
    const inU = names.some(n => uSet.has(n));
    const inV = names.some(n => vSet.has(n));
    return inU && inV ? 'both' : inV ? 'volatile' : inU ? 'unstable' : 'recipe';
  };

  const counts = { both: 0, volatile: 0, unstable: 0, recipe: 0 };
  for (const pkg of packages) {
    for (const sub of pkg.packages ?? []) sub.channel = classify([sub.name]);
    pkg.channel = classify([pkg.name, ...(pkg.packages ?? []).map(s => s.name)]);
    counts[pkg.channel as keyof typeof counts]++;
  }

  const commitSha = git(recipesDir, 'rev-parse', 'HEAD');
  const body: Omit<PackageIndex, 'generatedAt'> = {
    totalCount: packages.length,
    repoUrl: REPO_URL,
    commitSha,
    channelStats: {
      volatileCount: vSet.size,
      unstableCount: uSet.size,
      volatileOnlyCount: counts.volatile,
      bothCount: counts.both,
      recipeOnlyCount: counts.recipe,
    },
    packages,
  };

  // generatedAt only moves when the content does, so unchanged data gives an unchanged file.
  const { generatedAt: prevAt, ...prevBody } = previous ?? ({} as PackageIndex);
  const unchanged = previous && JSON.stringify(prevBody) === JSON.stringify(body);
  const output = { generatedAt: unchanged && prevAt ? prevAt : new Date().toISOString(), ...body };

  mkdirSync(dirname(PACKAGES_PATH), { recursive: true });
  const tmp = `${PACKAGES_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  renameSync(tmp, PACKAGES_PATH);

  console.log(`Indexed ${packages.length} packages (${failures.length} failed) from ${commitSha?.slice(0, 7) ?? 'unknown commit'}.`);
  console.log(`Channels: ${counts.both} both, ${counts.volatile} volatile-only, ${counts.unstable} unstable-only, ${counts.recipe} recipe-only.`);
  console.log(unchanged ? 'No change from previous index.' : `Wrote ${PACKAGES_PATH}`);
}

if (process.argv[1] && /generate-index\.(ts|js)$/.test(process.argv[1])) {
  try {
    main();
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
