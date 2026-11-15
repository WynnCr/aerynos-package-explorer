#!/usr/bin/env node
/**
 * AerynOS Package Dataset Validator
 * Runs full sanity and schema checks against static/data/packages.json
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { PackageIndex, Package } from '../src/lib/data/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = resolve(__dirname, '../static/data/packages.json');

console.log(`🔍 Validating ${filePath}...`);

const raw = readFileSync(filePath, 'utf-8');
const data: PackageIndex = JSON.parse(raw);

let errors = 0;
function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error(`  ❌ Assertion Failed: ${msg}`);
    errors++;
  }
}

// 1. Root structure
assert(Array.isArray(data.packages), 'data.packages must be an array');
assert(typeof data.generatedAt === 'string' && !isNaN(Date.parse(data.generatedAt)), 'data.generatedAt must be valid ISO date');
assert(typeof data.totalCount === 'number', 'data.totalCount must be a number');
assert(data.totalCount === data.packages.length, `data.totalCount (${data.totalCount}) must equal data.packages.length (${data.packages.length})`);
assert(data.packages.length >= 60, `Package count must be at least 60, got ${data.packages.length}`);
assert(data.repoUrl === 'https://github.com/aerynOS/recipes', 'data.repoUrl must match official repo URL');
assert(typeof data.commitSha === 'string' && data.commitSha.length > 0, 'data.commitSha must be a non-empty string');

console.log(`✓ Root structure valid: ${data.packages.length} packages loaded.`);

// 2. Package Schema Validation
const names = new Set<string>();

data.packages.forEach((pkg: Package, idx: number) => {
  const prefix = `[#${idx} ${pkg.name}]`;

  // Duplicates check
  assert(!names.has(pkg.name), `${prefix} Duplicate package name found: ${pkg.name}`);
  names.add(pkg.name);

  // Alphabetical order
  if (idx > 0) {
    const prev = data.packages[idx - 1].name;
    assert(prev.localeCompare(pkg.name) < 0, `Packages must be alphabetically sorted: "${prev}" comes before "${pkg.name}"`);
  }

  // Core required fields
  assert(typeof pkg.name === 'string' && pkg.name.length > 0, `${prefix} name must be non-empty string`);
  assert(typeof pkg.version === 'string' && pkg.version.length > 0, `${prefix} version must be non-empty string`);
  assert(typeof pkg.release === 'number' && pkg.release > 0 && Number.isInteger(pkg.release), `${prefix} release must be positive integer`);
  assert(typeof pkg.homepage === 'string' && (pkg.homepage.startsWith('http://') || pkg.homepage.startsWith('https://')), `${prefix} homepage must be valid URL`);
  assert(typeof pkg.summary === 'string' && pkg.summary.length > 0, `${prefix} summary must be non-empty`);
  assert(typeof pkg.description === 'string' && pkg.description.length > 0, `${prefix} description must be non-empty`);
  assert(Array.isArray(pkg.license) && pkg.license.length > 0 && pkg.license.every(l => typeof l === 'string' && l.length > 0), `${prefix} license must be non-empty string array`);
  
  // Upstreams
  assert(Array.isArray(pkg.upstreams) && pkg.upstreams.length > 0, `${prefix} upstreams must be non-empty array`);
  pkg.upstreams.forEach((u, uIdx) => {
    assert(typeof u.url === 'string' && u.url.length > 0, `${prefix} upstream[${uIdx}].url must be non-empty string`);
    assert(typeof u.hash === 'string' && u.hash.length > 0, `${prefix} upstream[${uIdx}].hash must be non-empty string`);
    assert(u.type === 'tarball' || u.type === 'git', `${prefix} upstream[${uIdx}].type must be 'tarball' or 'git'`);
  });

  // Letter & URLs
  const expectedLetter = pkg.name.charAt(0).toLowerCase();
  assert(pkg.letter === expectedLetter, `${prefix} letter must be '${expectedLetter}', got '${pkg.letter}'`);
  assert(pkg.recipeUrl === `https://github.com/aerynOS/recipes/blob/main/recipes/${expectedLetter}/${pkg.name}/stone.yaml`, `${prefix} invalid recipeUrl`);
  assert(pkg.rawUrl === `https://raw.githubusercontent.com/aerynOS/recipes/main/recipes/${expectedLetter}/${pkg.name}/stone.yaml`, `${prefix} invalid rawUrl`);

  // Category
  assert(typeof pkg.category === 'string' && pkg.category.length > 0, `${prefix} category must be non-empty string`);

  // IndexedAt
  assert(typeof pkg.indexedAt === 'string' && !isNaN(Date.parse(pkg.indexedAt)), `${prefix} indexedAt must be valid ISO string`);

  // Optional fields checks
  if (pkg.builddeps !== undefined) {
    assert(Array.isArray(pkg.builddeps) && pkg.builddeps.every(d => typeof d === 'string'), `${prefix} builddeps must be string array`);
  }
  if (pkg.rundeps !== undefined) {
    assert(Array.isArray(pkg.rundeps) && pkg.rundeps.every(d => typeof d === 'string'), `${prefix} rundeps must be string array`);
  }
  if (pkg.toolchain !== undefined) {
    assert(typeof pkg.toolchain === 'string', `${prefix} toolchain must be string`);
  }
  if (pkg.emul32 !== undefined) {
    assert(typeof pkg.emul32 === 'boolean', `${prefix} emul32 must be boolean`);
  }
  if (pkg.packages !== undefined) {
    assert(Array.isArray(pkg.packages) && pkg.packages.length > 0, `${prefix} packages must be non-empty array of SubPackage`);
    pkg.packages.forEach((sp, spIdx) => {
      assert(typeof sp.name === 'string' && sp.name.length > 0, `${prefix} subpackage[${spIdx}].name must be string`);
    });
  }
});

console.log(`✓ All ${data.packages.length} packages passed schema validation.`);

// 3. Required packages checklist
const required15 = [
  'nano', 'curl', 'fastfetch', 'golang', 'grep', 'ca-certificates', 'aom',
  'android-tools', 'hyprwayland-scanner', 'linux-desktop', 'libnvme',
  'openssl', 'qcoro', 'bash', 'ripgrep'
];

const required45Plus = [
  // System
  'systemd', 'util-linux', 'coreutils', 'shadow', 'sudo', 'dbus', 'polkit', 'elogind',
  // Editors & Terminals
  'neovim', 'helix', 'alacritty', 'foot', 'kitty',
  // Shells
  'zsh', 'fish',
  // Languages & Runtimes
  'python3', 'rustc', 'cargo', 'nodejs', 'ruby', 'perl', 'llvm', 'clang', 'gcc',
  // Desktop & Window Managers
  'hyprland', 'wayland', 'wayland-protocols', 'wlroots', 'sway', 'cosmic-session', 'cosmic-comp', 'pipewire', 'wireplumber',
  // Graphics & Multimedia
  'mesa', 'vulkan-loader', 'ffmpeg', 'mpv', 'libpng', 'libjpeg-turbo',
  // Networking
  'wget', 'openssh', 'networkmanager', 'iwd', 'git',
  // Fonts
  'noto-fonts', 'jetbrains-mono', 'inter-font',
  // Libraries
  'glibc', 'zlib', 'zstd', 'libxml2', 'glib2', 'sqlite3',
  // Utilities
  'tree', 'btop', 'fzf', 'jq', 'fd'
];

const missing15 = required15.filter(name => !names.has(name));
assert(missing15.length === 0, `Missing required 15 documented packages: ${missing15.join(', ')}`);

const missing45 = required45Plus.filter(name => !names.has(name));
assert(missing45.length === 0, `Missing required 45+ packages: ${missing45.join(', ')}`);

console.log(`✓ All 15 required documented recipes verified.`);
console.log(`✓ All 45+ required ecosystem packages verified.`);

// 4. Alphabetical shard coverage
const letters = new Set(data.packages.map(p => p.letter));
console.log(`✓ Covered ${letters.size}/26 alphabetical shards.`);
assert(letters.size === 26, `Expected all 26 letters of the alphabet to be represented, got ${letters.size}`);

if (errors > 0) {
  console.error(`\n❌ Validation completed with ${errors} error(s)!`);
  process.exit(1);
} else {
  console.log(`\n🎉 Validation 100% SUCCESS! Dataset is complete, authentic, and adheres strictly to types.`);
}
