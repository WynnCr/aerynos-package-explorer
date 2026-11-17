/**
 * Sanity-checks static/data/packages.json (and channels.json if present).
 * Exits 1 on any problem. Run with: pnpm validate-dataset
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { PackageIndex } from '../src/lib/data/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems: string[] = [];
const fail = (msg: string) => problems.push(msg);

const index: PackageIndex = JSON.parse(readFileSync(join(root, 'static/data/packages.json'), 'utf-8'));

if (index.totalCount !== index.packages.length) fail(`totalCount ${index.totalCount} != packages.length ${index.packages.length}`);
if (index.packages.length < 500) fail(`only ${index.packages.length} packages; the real repo has well over 1000`);
if (Number.isNaN(Date.parse(index.generatedAt))) fail(`generatedAt is not a date: ${index.generatedAt}`);
if (index.commitSha && !/^[0-9a-f]{40}$/.test(index.commitSha)) fail(`commitSha looks wrong: ${index.commitSha}`);

const seen = new Set<string>();
let prev = '';
for (const p of index.packages) {
  if (seen.has(p.name)) fail(`duplicate package ${p.name}`);
  seen.add(p.name);
  if (p.name < prev) fail(`not sorted: ${p.name} after ${prev}`);
  prev = p.name;

  for (const k of ['version', 'summary', 'letter', 'recipeUrl', 'rawUrl', 'category'] as const) {
    if (!p[k]) fail(`${p.name}: missing ${k}`);
  }
  if (p.letter !== p.name[0]?.toLowerCase()) fail(`${p.name}: letter ${p.letter} does not match name`);
  const tail = `/main/${p.letter}/${p.name}/stone.yaml`;
  if (!p.recipeUrl.endsWith(tail) || !p.rawUrl.endsWith(tail)) fail(`${p.name}: bad recipeUrl/rawUrl`);
  if (!Number.isInteger(p.release) || p.release < 1) fail(`${p.name}: bad release ${p.release}`);
  if (!Array.isArray(p.license)) fail(`${p.name}: license is not an array`);
}

const channelsPath = join(root, 'static/data/channels.json');
if (existsSync(channelsPath)) {
  const ch = JSON.parse(readFileSync(channelsPath, 'utf-8'));
  const stats = index.channelStats;
  if (stats && stats.unstableCount !== ch.unstablePackages.length) fail('channelStats.unstableCount does not match channels.json');
  const sum = (stats?.bothCount ?? 0) + (stats?.volatileOnlyCount ?? 0) + (stats?.recipeOnlyCount ?? 0);
  const unstableOnly = index.packages.filter(p => p.channel === 'unstable').length;
  if (stats && sum + unstableOnly !== index.packages.length) fail('channel buckets do not add up to totalCount');
}

if (problems.length) {
  console.error(`${problems.length} problem(s):`);
  for (const m of problems.slice(0, 30)) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(`packages.json OK: ${index.packages.length} packages`);
