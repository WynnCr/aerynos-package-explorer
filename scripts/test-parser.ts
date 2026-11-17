#!/usr/bin/env node
/**
 * aerynOS Package Parser Tests
 *
 * Tests the stone.yaml parser with known-good examples from the recipes repository.
 * Run with: npx tsx scripts/test-parser.ts
 */

import { load as parseYaml } from 'js-yaml';
import { parseStoneYaml, inferCategory } from './generate-index.js';

// ============================================================
// Minimal test harness
// ============================================================

let passed = 0;
let failed = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  const aStr = JSON.stringify(actual);
  const eStr = JSON.stringify(expected);
  if (aStr === eStr) {
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${label}`);
    console.error(`         expected: ${eStr}`);
    console.error(`         actual  : ${aStr}`);
    failed++;
  }
}

function checkTruthy(label: string, actual: unknown): void {
  if (actual) {
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${label} (got falsy: ${JSON.stringify(actual)})`);
    failed++;
  }
}

function checkFalsy(label: string, actual: unknown): void {
  if (!actual) {
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${label} (expected falsy, got: ${JSON.stringify(actual)})`);
    failed++;
  }
}

function section(name: string): void {
  console.log(`\n── ${name} ──`);
}

// ============================================================
// Example YAML fixtures
// ============================================================

const NANO_YAML = `
name        : nano
version     : 8.7
release     : 38
homepage    : https://www.nano-editor.org/
upstreams   :
    - https://www.nano-editor.org/dist/v8/nano-8.7.tar.xz : afd287aa672c48b8e1a93fdb6c6588453d527510d966822b687f2835f0d986e9
summary     : GNU Text Editor
description : |
    GNU nano is a small and friendly text editor. Besides basic text
    editing, nano offers many extra features like an interactive search
    and replace, go to line and column number, auto-indentation, feature
    toggles, internationalization support, and filename tab completion.
license     :
    - GPL-3.0-or-later
builddeps   :
    - binary(msgfmt)
    - pkgconfig(libmagic)
    - pkgconfig(ncursesw)
toolchain   : gnu
`;

const CURL_YAML = `
name        : curl
version     : 8.13.0
release     : 86
homepage    : https://curl.se/
upstreams   :
    - https://curl.se/download/curl-8.13.0.tar.xz : e7a0a52fb76be7a3b31fb2d80b69ff93a7ea61ffe6e45f56edb0bf2c68bf7773
summary     : URL retrieval utility and library
description : |
    curl is a tool for transferring data from or to a server, using one of
    the supported protocols (HTTP, HTTPS, FTP, FTPS, GOPHER, DICT, TELNET,
    LDAP or FILE). The command is designed to work without user interaction.
license     :
    - curl
builddeps   :
    - pkgconfig(libnghttp2)
    - pkgconfig(libnghttp3)
    - pkgconfig(libngtcp2)
    - pkgconfig(libngtcp2-crypto-openssl)
    - pkgconfig(libpsl)
    - pkgconfig(libssh2)
    - pkgconfig(libzstd)
    - pkgconfig(openssl)
    - pkgconfig(zlib)
emul32      : true
packages    :
    - "%(name)-libs" :
          summary : curl libraries
          description : Libraries needed to run applications built with curl
          paths  :
              - /usr/lib/libcurl.so.*
    - "%(name)-libs-32bit" :
          summary : 32-bit curl libraries
          paths  :
              - /usr/lib32/libcurl.so.*
`;

const LICENSE_STRING_YAML = `
name        : grep
version     : 3.11
release     : 10
homepage    : https://www.gnu.org/software/grep/
upstreams   :
    - https://ftp.gnu.org/gnu/grep/grep-3.11.tar.xz : 1db2aedde89d0dea42b16d9528f894c8d15dae4e190b59aecc78f5a951276eab
summary     : GNU grep, egrep and fgrep
description : |
    The grep command searches one or more input files for lines containing
    a match to a specified pattern.
license     : GPL-3.0-or-later
`;

const GIT_UPSTREAM_YAML = `
name        : myproject
version     : 1.0.0
release     : 1
homepage    : https://example.com/
upstreams   :
    - git|https://github.com/example/myproject.git : abc123deadbeef
summary     : Example project with git upstream
description : A project fetched directly from git.
license     :
    - MIT
`;

const TUNING_YAML = `
name        : fastfetch
version     : 2.42.0
release     : 25
homepage    : https://github.com/fastfetch-cli/fastfetch
upstreams   :
    - https://github.com/fastfetch-cli/fastfetch/archive/refs/tags/2.42.0.tar.gz : 1234567890abcdef
summary     : Fast system information tool
description : |
    Fastfetch is a neofetch-like tool for fetching system information
    and displaying them in a pretty way. It is written mainly in C.
license     :
    - MIT
tune        :
    - lto
    - optimize-speed
builddeps   :
    - cmake(CMake)
    - pkgconfig(dbus-1)
`;

const VERSION_NUMBER_YAML = `
name        : python3
version     : 3.13.3
release     : 24
homepage    : https://www.python.org/
upstreams   :
    - https://www.python.org/ftp/python/3.13.3/Python-3.13.3.tar.xz : abcdef1234567890
summary     : Python 3 interpreter
description : Python is a high-level programming language.
license     :
    - PSF-2.0
`;

// ============================================================
// Tests
// ============================================================

section('nano — basic package, license as array');
{
  const pkg = parseStoneYaml(NANO_YAML, 'nano', 'n');
  checkTruthy('parse succeeded', pkg);
  if (pkg) {
    check('name', pkg.name, 'nano');
    check('version', pkg.version, '8.7');
    check('release', pkg.release, 38);
    check('homepage', pkg.homepage, 'https://www.nano-editor.org/');
    check('summary', pkg.summary, 'GNU Text Editor');
    check('license', pkg.license, ['GPL-3.0-or-later']);
    check('letter', pkg.letter, 'n');
    check('toolchain', pkg.toolchain, 'gnu');
    checkTruthy('description non-empty', pkg.description.length > 10);
    check('upstreams length', pkg.upstreams.length, 1);
    check('upstream type', pkg.upstreams[0].type, 'tarball');
    checkTruthy('upstream url', pkg.upstreams[0].url.includes('nano-8.7'));
    checkTruthy('upstream hash non-empty', pkg.upstreams[0].hash.length > 10);
    check('builddeps length', pkg.builddeps?.length, 3);
    checkTruthy('builddeps includes binary(msgfmt)', pkg.builddeps?.includes('binary(msgfmt)'));
    checkTruthy('builddeps includes pkgconfig(libmagic)', pkg.builddeps?.includes('pkgconfig(libmagic)'));
    check('recipeUrl contains letter+name', pkg.recipeUrl.includes('/n/nano/stone.yaml'), true);
    check('rawUrl contains letter+name', pkg.rawUrl.includes('/n/nano/stone.yaml'), true);
    // No sub-packages
    checkFalsy('no sub-packages', pkg.packages?.length);
  }
}

section('curl — emul32, sub-packages, pkgconfig deps');
{
  const pkg = parseStoneYaml(CURL_YAML, 'curl', 'c');
  checkTruthy('parse succeeded', pkg);
  if (pkg) {
    check('name', pkg.name, 'curl');
    check('version', pkg.version, '8.13.0');
    check('release', pkg.release, 86);
    check('license', pkg.license, ['curl']);
    check('emul32', pkg.emul32, true);
    checkTruthy('builddeps present', (pkg.builddeps?.length ?? 0) > 0);
    // Sub-packages
    check('sub-packages count', pkg.packages?.length, 2);
    if (pkg.packages) {
      check('first sub-package name', pkg.packages[0].name, 'curl-libs');
      check('first sub-package summary', pkg.packages[0].summary, 'curl libraries');
      check('first sub-package paths', pkg.packages[0].paths, ['/usr/lib/libcurl.so.*']);
      check('second sub-package name', pkg.packages[1].name, 'curl-libs-32bit');
    }
    // recipeUrl
    check('recipeUrl uses pkg name from yaml', pkg.recipeUrl.includes('/c/curl/stone.yaml'), true);
  }
}

section('grep — license as plain string (not array)');
{
  const pkg = parseStoneYaml(LICENSE_STRING_YAML, 'grep', 'g');
  checkTruthy('parse succeeded', pkg);
  if (pkg) {
    check('name', pkg.name, 'grep');
    // license string must be normalized to array
    check('license normalized to array', pkg.license, ['GPL-3.0-or-later']);
    check('release as int', pkg.release, 10);
    checkFalsy('no builddeps', pkg.builddeps);
    checkFalsy('no emul32', pkg.emul32);
  }
}

section('git upstream');
{
  const pkg = parseStoneYaml(GIT_UPSTREAM_YAML, 'myproject', 'm');
  checkTruthy('parse succeeded', pkg);
  if (pkg) {
    check('upstreams length', pkg.upstreams.length, 1);
    check('upstream type git', pkg.upstreams[0].type, 'git');
    check('git prefix stripped from url', pkg.upstreams[0].url.startsWith('https://'), true);
    checkFalsy('git| prefix not in url', pkg.upstreams[0].url.includes('git|'));
    check('git hash', pkg.upstreams[0].hash, 'abc123deadbeef');
  }
}

section('tune synonym (instead of tuning)');
{
  const pkg = parseStoneYaml(TUNING_YAML, 'fastfetch', 'f');
  checkTruthy('parse succeeded', pkg);
  if (pkg) {
    checkTruthy('tuning parsed from tune key', Array.isArray(pkg.tuning));
    check('tuning values', pkg.tuning, ['lto', 'optimize-speed']);
    checkTruthy('builddeps with cmake specifier', pkg.builddeps?.includes('cmake(CMake)'));
  }
}

section('version normalization — version as number vs string');
{
  // version: 8.7 (YAML parses as number 8.7)
  const pkg1 = parseStoneYaml(NANO_YAML, 'nano', 'n');
  checkTruthy('version is string not number', typeof pkg1?.version === 'string');
  check('version value correct', pkg1?.version, '8.7');

  // version as explicit string
  const pkg2 = parseStoneYaml(VERSION_NUMBER_YAML, 'python3', 'p');
  checkTruthy('python3 parse succeeded', pkg2);
  check('python3 version', pkg2?.version, '3.13.3');
}

section('invalid / empty YAML');
{
  const nullResult = parseStoneYaml('', 'bad', 'b');
  checkFalsy('empty string returns null', nullResult);

  const invalidResult = parseStoneYaml('not: valid: yaml: [', 'bad', 'b');
  checkFalsy('invalid yaml returns null', invalidResult);

  const justString = parseStoneYaml('"just a string"', 'bad', 'b');
  checkFalsy('non-object yaml returns null', justString);
}

section('inferCategory');
{
  const nano = parseStoneYaml(NANO_YAML, 'nano', 'n')!;
  check('nano → Editors', inferCategory(nano), 'Editors');

  const curl = parseStoneYaml(CURL_YAML, 'curl', 'c')!;
  check('curl → Networking', inferCategory(curl), 'Networking');

  const grep = parseStoneYaml(LICENSE_STRING_YAML, 'grep', 'g')!;
  // grep is a utility / command line tool
  const grepCat = inferCategory(grep);
  checkTruthy('grep category is valid string', typeof grepCat === 'string' && grepCat.length > 0);

  const python3 = parseStoneYaml(VERSION_NUMBER_YAML, 'python3', 'p')!;
  check('python3 → Languages', inferCategory(python3), 'Languages');
}

// ============================================================
// Summary
// ============================================================

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
if (failed === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.error(`⚠️  ${failed} test(s) failed.`);
  process.exit(1);
}
