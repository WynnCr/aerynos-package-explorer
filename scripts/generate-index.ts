#!/usr/bin/env node
/**
 * AerynOS package index generator.
 *
 * Reads every <letter>/<name>/stone.yaml (and typos/<name>/stone.yaml) in aerynOS/recipes and writes
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
import type { Package, PackageIndex, PackageDetails, DetailsShard } from '../src/lib/data/types';

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
const DETAILS_DIR = join(ROOT, 'static', 'data', 'details');
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
  dir: string = letter, // recipes live in <letter>/ except the misspelled-name ones in typos/
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
      recipeUrl: `${GITHUB_BLOB_BASE}/${dir}/${name}/stone.yaml`,
      rawUrl: `${RAW_BASE}/${dir}/${name}/stone.yaml`,
    };

    // Optional fields (only add if present / truthy)
    if (Array.isArray(raw.builddeps) && (raw.builddeps as unknown[]).length > 0) {
      pkg.builddeps = (raw.builddeps as unknown[]).map(String);
    }
    if (Array.isArray(raw.checkdeps) && (raw.checkdeps as unknown[]).length > 0) {
      pkg.checkdeps = (raw.checkdeps as unknown[]).map(String);
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
 * Guess a category for a recipe. This is NOT AerynOS metadata; recipes have no category field.
 *
 * Rules run in order and the first match wins. Package names are trusted more than free text,
 * and free text is only the one-line summary, matched on whole words (the long description is
 * full of incidental words like "font", "game" or "network" that used to misfile packages).
 */
type Rule = { category: string; name?: RegExp; summary?: RegExp };

const CATEGORY_RULES: Rule[] = [
  // --- decided by name ---
  { category: 'Fonts', name: /^(font-|noto-)|-fonts?$|nerd-font/ },
  {
    category: 'Languages',
    name: /^(python3?|perl|ruby|lua|luajit|nodejs|node|go|golang|rust|java|openjdk(-\d+)?|erlang|elixir|ghc|php|ocaml|zig(-[\d.]+)?|dotnet.*|swift|kotlin|nim|crystal|dmd|ldc|julia|tcl)$|^(python3?|perl|ruby)-/,
  },
  { category: 'Libraries', name: /^lib(?!reoffice|virt$|tool$)|^kf[56]-|^qt6?-|-bindings$|^(gtk|gtk4|gtkmm.*|glibmm.*|pangomm.*|cairomm.*|atkmm.*)$|-glib$|-lib$|-sys$/ },
  { category: 'Games', name: /^(steam|wine|gamemode|lutris|retroarch|supertux|0ad)/ },
  { category: 'Editors', name: /^(nano|vim|neovim|emacs|helix|cosmic-edit|kate|kwrite|gedit|vscodium|micro|kakoune|neovide|focuswriter|libreoffice)/ },
  { category: 'Desktop', name: /^(plasma|kwin|kde|gnome|budgie|cosmic|xfce|hypr|sway|wlroots|niri|waybar|mutter|cinnamon|lxqt|xdg-|xorg|wayland|mangowc|dank|quickshell|caffyne|rofi|wofi|foot|alacritty|kitty|ghostty)/ },
  { category: 'Development', name: /^(gcc|clang|llvm)(-\d+)?$|^(cmake|meson|ninja|make|gdb|lldb|valgrind|autoconf|automake|libtool|bison|flex|gperf|pkgconf|binutils|ccache|bazel.*|just|strace|ltrace|perf|cargo-.*|rust-.*|npm|yarn|pnpm|pahole|debugedit|upx)$/ },
  { category: 'Security', name: /^(kwallet|gnupg|openssl|openssh|libressl|pam|polkit)/ },
  { category: 'System', name: /^(systemd|linux-.*|dracut|grub|udev|polkit|dbus)$/ },

  // --- decided by the one-line summary (whole words) ---
  { category: 'Fonts', summary: /\b(typeface|font|fonts)\b/ },
  { category: 'Languages', summary: /\b(programming language|interpreter|scripting language|runtime environment|javascript|typescript)\b/ },
  { category: 'Games', summary: /\b(games?|emulator|arcade|puzzle)\b/ },
  { category: 'Editors', summary: /\b(text editor|code editor|editor|word processor|ide)\b/ },
  { category: 'Security', summary: /\b(encryption|cryptograph\w*|passwords?|ssl|tls|gpg|pgp|keyring|firewall|authentication|vulnerabilit\w*|sandbox\w*|polkit|policykit)\b/ },
  { category: 'Multimedia', summary: /\b(audio|video|music|sound|media|codecs?|encoder|decoder|ffmpeg|gstreamer|pipewire|mp3|opus|hevc|h\.?26[45]|dsp|stereo|subtitles?|speech|pictures|openal)\b/ },
  { category: 'Graphics', summary: /\b(images?|graphics?|png|jpeg|svg|vector|raster|photos?|paint|icons?|3d|opengl|vulkan|render\w*|ocr|color|colour)\b/ },
  { category: 'Networking', summary: /\b(network\w*|https?|dns|ssh|ftp|tcp|udp|vpn|wi-?fi|wireless|bluetooth|proxy|web ?server|browser|e-?mail|mail|download\w*|torrent|sync\w*|chat|mastodon|fediverse|rdp|urls?)\b/ },
  { category: 'Desktop', summary: /\b(desktop|window manager|wayland|compositor|x11|gtk\d?|qt\d?|kde|gnome|plasma|panel|launcher|theme|cursor|workspace|screen|keyboard|tray|calendar|scheduling|contacts|pim|window decorations?)\b/ },
  { category: 'System', summary: /\b(kernel|systemd|file ?systems?|boot\w*|firmware|hardware|device|printing|cups|accounts?|drivers?|daemon|containers?|oci|virtual\w*|disk|partition\w*|init|udev|d-bus|dbus|pci|usb|scheduler|power|zram|efi|uefi|ebpf|microcode|regulatory|cpus?|fan|laptop|mouse|time ?zone)\b/ },
  { category: 'Development', summary: /\b(compiler|debugger|build|toolchain|linker|assembler|debug|profil\w*|lint\w*|formatter|generator|bindings|api|sdk|parser|serializ\w*|json|yaml|xml|language server|package manager|macros?|git|protocols?|preprocessor|databases?|sql|markup|hash|algorithm|converter)\b/ },
  { category: 'Libraries', summary: /\b(library|libraries|framework|toolkit|routines|primitives?)\b/ },
  { category: 'Utilities', summary: /\b(command-line|command line|cli|terminal|tui|tools?|utility|utilities|viewer|monitor|archiv\w*|compress\w*|search|man pages?|shell|backup|spelling|dotfiles|files|manager|symlink|diff)\b/ },
];

export function inferCategory(pkg: Package): string {
  const name = pkg.name.toLowerCase();
  const summary = pkg.summary.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.name?.test(name) || rule.summary?.test(summary)) return rule.category;
  }
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

/**
 * Split a parsed recipe into what the search page needs (kept in packages.json) and the heavy rest
 * (build scripts, upstreams, sub-package paths), which goes to details/<letter>.json.
 */
export function splitPackage(pkg: Package): { light: Package; details: PackageDetails } {
  const { upstreams, setup, build, install, check, environment, tuning, profiles, ...light } = pkg;
  const details: PackageDetails = { upstreams: upstreams ?? [] };
  if (setup !== undefined) details.setup = setup;
  if (build !== undefined) details.build = build;
  if (install !== undefined) details.install = install;
  if (check !== undefined) details.check = check;
  if (environment !== undefined) details.environment = environment;
  if (tuning !== undefined) details.tuning = tuning;
  if (profiles !== undefined) details.profiles = profiles;
  if (pkg.packages) {
    const subs: NonNullable<PackageDetails['subpackages']> = [];
    light.packages = pkg.packages.map(({ description, paths, ...sub }) => {
      subs.push(description !== undefined || paths !== undefined
        ? { ...(description !== undefined && { description }), ...(paths !== undefined && { paths }) }
        : null);
      return sub;
    });
    if (subs.some(Boolean)) details.subpackages = subs;
  }
  return { light, details };
}

/** Write a file atomically, and only if the content differs. Returns whether it wrote. */
function writeIfChanged(path: string, text: string): boolean {
  try {
    if (readFileSync(path, 'utf-8') === text) return false;
  } catch { /* missing: write it */ }
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, text, 'utf-8');
  renameSync(tmp, path);
  return true;
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

  // typos/ holds real, shipped packages whose names are misspelled (oniguurma, uuutils-coreutils, ...)
  // and can't be renamed; they sit outside the <letter>/ sharding but are installable like any other.
  for (const dir of [...'abcdefghijklmnopqrstuvwxyz', 'typos']) {
    const letterPath = join(recipesDir, dir);
    if (!existsSync(letterPath)) continue;

    for (const entry of readdirSync(letterPath)) {
      const stonePath = join(letterPath, entry, 'stone.yaml');
      if (!existsSync(stonePath) || !statSync(join(letterPath, entry)).isDirectory()) continue;
      try {
        const letter = dir === 'typos' ? entry[0].toLowerCase() : dir;
        const pkg = parseStoneYaml(readFileSync(stonePath, 'utf-8'), entry, letter, dir);
        if (!pkg) throw new Error('parser returned null');
        pkg.category = inferCategory(pkg);
        packages.push(pkg);
      } catch (e) {
        failures.push(`${dir}/${entry}: ${e instanceof Error ? e.message : e}`);
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

  const shards: Record<string, DetailsShard> = {};
  const lightPackages = packages.map(pkg => {
    const { light, details } = splitPackage(pkg);
    (shards[pkg.letter] ??= {})[pkg.name] = details;
    return light;
  });

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
    packages: lightPackages,
  };

  // generatedAt only moves when the content does, so unchanged data gives an unchanged file.
  const { generatedAt: prevAt, ...prevBody } = previous ?? ({} as PackageIndex);
  const unchanged = previous && JSON.stringify(prevBody) === JSON.stringify(body);
  const output = { generatedAt: unchanged && prevAt ? prevAt : new Date().toISOString(), ...body };

  writeIfChanged(PACKAGES_PATH, JSON.stringify(output, null, 2) + '\n');

  // One compact line per package keeps the files small and the git diffs readable.
  let shardsWritten = 0;
  for (const [letter, shard] of Object.entries(shards).sort(([a], [b]) => cmpCodepoint(a, b))) {
    const lines = Object.keys(shard).sort(cmpCodepoint).map(n => `${JSON.stringify(n)}:${JSON.stringify(shard[n])}`);
    if (writeIfChanged(join(DETAILS_DIR, `${letter}.json`), `{\n${lines.join(',\n')}\n}\n`)) shardsWritten++;
  }
  if (existsSync(DETAILS_DIR)) {
    for (const f of readdirSync(DETAILS_DIR)) {
      if (f.endsWith('.json') && !(f.slice(0, -5) in shards)) rmSync(join(DETAILS_DIR, f));
    }
  }

  console.log(`Indexed ${packages.length} packages (${failures.length} failed) from ${commitSha?.slice(0, 7) ?? 'unknown commit'}.`);
  console.log(`Channels: ${counts.both} both, ${counts.volatile} volatile-only, ${counts.unstable} unstable-only, ${counts.recipe} recipe-only.`);
  console.log(unchanged && shardsWritten === 0 ? 'No change from previous index.' : `Wrote ${PACKAGES_PATH} and ${shardsWritten} detail file(s)`);
}

if (process.argv[1] && /generate-index\.(ts|js)$/.test(process.argv[1])) {
  try {
    main();
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
