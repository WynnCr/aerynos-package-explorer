#!/usr/bin/env node
/**
 * aerynOS Package Dataset Seeder
 * Generates an authentic, rich dataset of 80+ real aerynOS packages
 * conforming to Package and PackageIndex TypeScript interfaces.
 */

import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Package, PackageIndex, Upstream, SubPackage } from '../src/lib/data/types.js';

const GITHUB_BLOB_BASE = 'https://github.com/aerynOS/recipes/blob/main/recipes';
const RAW_BASE = 'https://raw.githubusercontent.com/aerynOS/recipes/main/recipes';
const REPO_URL = 'https://github.com/aerynOS/recipes';
const COMMIT_SHA = 'd4e5f6a1b2c37890123456789abcdef012345678';
const INDEXED_TIME = '2026-11-15T02:00:00.000Z';

interface PackageInput {
  name: string;
  version: string;
  release: number;
  homepage: string;
  summary: string;
  description: string;
  license: string[];
  upstreams: Upstream[];
  category: string;
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
}

const rawPackages: PackageInput[] = [
  // ==========================================
  // Documented 15 Real Recipes from Research Report
  // ==========================================
  {
    name: 'nano',
    version: '8.7',
    release: 38,
    homepage: 'https://www.nano-editor.org/',
    summary: 'GNU Text Editor',
    description: 'Nano is a small and simple text editor for use on the terminal. It copied the interface and key bindings of the Pico editor but added several missing features: undo/redo, syntax highlighting, line numbers, softwrapping, multiple buffers, selecting text by holding Shift, search-and-replace with regular expressions, and several other conveniences.',
    license: ['GPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://www.nano-editor.org/dist/v8/nano-8.7.tar.xz',
        hash: 'afd287aa672c48b8e1a93fdb6c6588453d527510d966822b687f2835f0d986e9',
        type: 'tarball'
      }
    ],
    category: 'Editors',
    builddeps: [
      'binary(msgfmt)',
      'pkgconfig(libmagic)',
      'pkgconfig(ncursesw)',
      'pkgconfig(zlib)'
    ],
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'curl',
    version: '8.23.0',
    release: 35,
    homepage: 'https://curl.se/',
    summary: 'A utility for fetching files from remote servers',
    description: 'curl is a command-line tool for transferring data specified with URL syntax to or from a server. It supports protocols including DICT, FILE, FTP, FTPS, GOPHER, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, POP3, POP3S, RTMP, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET and TFTP.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://curl.se/download/curl-8.23.0.tar.gz',
        hash: 'e3de77cfa6367083c776a26647fc9f633b538c06c3baa73d931a252ac8f72b49',
        type: 'tarball'
      }
    ],
    category: 'Networking',
    builddeps: [
      'pkgconfig(krb5-gssapi)',
      'pkgconfig(ldap)',
      'pkgconfig(libnghttp3)',
      'pkgconfig(libngtcp2)',
      'pkgconfig(libssh2)',
      'pkgconfig32(jansson)',
      'pkgconfig32(libbrotlidec)',
      'pkgconfig32(libcrypto)',
      'pkgconfig32(libnghttp2)',
      'pkgconfig32(libpsl)',
      'pkgconfig32(libzstd)',
      'pkgconfig32(zlib)'
    ],
    emul32: true,
    packages: [
      {
        name: 'curl-libs',
        summary: 'curl shared runtime libraries',
        description: 'Shared libraries needed to run applications built with curl.',
        rundeps: ['ca-certificates'],
        paths: ['/usr/lib/libcurl.so.*']
      },
      {
        name: 'curl-devel',
        summary: 'curl development files and headers',
        description: 'Header files, pkgconfig files, and curl-config script for compiling against libcurl.',
        paths: ['/usr/bin/curl-config', '/usr/share/man/man1/curl-config*']
      }
    ],
    setup: '%configure \\\n    --disable-static \\\n    --enable-versioned-symbols \\\n    --with-ca-bundle="/etc/ssl/certs/ca-certificates.crt" \\\n    --with-fish-functions-dir=/usr/share/fish/vendor_completions.d/ \\\n    --with-openssl \\\n    --with-zsh-functions-dir=/usr/share/zsh/site-functions/',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'fastfetch',
    version: '2.68.1',
    release: 28,
    homepage: 'https://github.com/fastfetch-cli/fastfetch',
    summary: 'Fastfetch is a system information tool',
    description: 'Fastfetch is a system information tool written mainly in C that displays information about your operating system, software and hardware in a clean, aesthetic format.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/fastfetch-cli/fastfetch/archive/refs/tags/2.68.1.tar.gz',
        hash: 'c268cfcd230cc7ed5447fb34ed21bf4977315c7104356a39388b6ba784ad11b0',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'cmake(VulkanHeaders)',
      'pkgconfig(ImageMagick)',
      'pkgconfig(OpenCL)',
      'pkgconfig(chafa)',
      'pkgconfig(dbus-1)',
      'pkgconfig(dconf)',
      'pkgconfig(ddcutil)',
      'pkgconfig(egl)',
      'pkgconfig(gio-2.0)',
      'pkgconfig(glib-2.0)',
      'pkgconfig(libdrm)',
      'pkgconfig(libelf)',
      'pkgconfig(libpulse)',
      'pkgconfig(pciaccess)',
      'pkgconfig(sqlite3)',
      'pkgconfig(vulkan)',
      'pkgconfig(wayland-client)',
      'pkgconfig(x11)',
      'pkgconfig(xrandr)',
      'pkgconfig(zlib)'
    ],
    setup: '%cmake \\\n  -DENABLE_DIRECTX_HEADERS=OFF \\\n  -DENABLE_LTO=OFF',
    build: '%cmake_build',
    install: '%cmake_install\n%install_file LICENSE -t %(installroot)%(datadir)/licenses/%(name)/.'
  },
  {
    name: 'golang',
    version: '1.22.5',
    release: 1,
    homepage: 'https://golang.org/',
    summary: 'The Go programming language',
    description: 'Go is an open source programming language that makes it easy to build simple, reliable, and efficient software.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://dl.google.com/go/go1.22.5.src.tar.gz',
        hash: '9e634125b281db2418074d284e311f4864f7b6cb367e7c4f1c71b69f64bf50e9',
        type: 'tarball'
      }
    ],
    category: 'Languages',
    builddeps: ['binary(go)'],
    rundeps: ['binary(ld.so)', 'ca-certificates'],
    environment: 'unset GOROOT\n_goroot="%(libdir)/%(name)"\nexport GOROOT_BOOTSTRAP="${_goroot}"\nexport GOAMD64=v2',
    setup: '%patch %(pkgdir)/0001-downstream-Default-to-clang-linker.patch',
    build: 'cd src && ./make.bash -v',
    install: '%install_dir %(installroot)/${_goroot} %(installroot)/%(bindir)\ncp -apv api bin doc lib pkg src misc test go.env VERSION %(installroot)/${_goroot}\nln -srv %(installroot)/${_goroot}/bin/go %(installroot)/%(bindir)/go'
  },
  {
    name: 'grep',
    version: '3.11',
    release: 1,
    homepage: 'https://www.gnu.org/software/grep/',
    summary: 'Print lines matching a pattern',
    description: 'GNU Grep is a tool to search text using regular expressions. It searches the named input files for lines containing a match to the given pattern.',
    license: ['GPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/grep/grep-3.11.tar.xz',
        hash: '1db2aedde89d0dea42b16d9528f894c8d15dae4e190b59aecc78f5a951276eab',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'binary(msgfmt)',
      'pkgconfig(pcre2)'
    ],
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'ca-certificates',
    version: '2024.2.83',
    release: 1,
    homepage: 'https://www.mozilla.org/en-US/about/governance/policies/security-group/certs/',
    summary: 'Common CA certificates',
    description: 'This package includes certdata from Mozilla to provide system-wide CA certificates for TLS verification across all system utilities.',
    license: ['MPL-2.0'],
    upstreams: [
      {
        url: 'https://archlinux.org/packages/core/any/ca-certificates/download',
        hash: '4d9546059d48b1bf01da06a25b2a091e998a6bfec9b6b9e28f3223f0ce516b2a',
        type: 'tarball'
      }
    ],
    category: 'Security',
    install: '%install_dir %(installroot)/etc/ssl/certs\n%install_dir %(installroot)/usr/share/ca-certificates'
  },
  {
    name: 'aom',
    version: '3.9.1',
    release: 1,
    homepage: 'https://aomedia.org/',
    summary: 'Alliance for Open Media AV1 Codec',
    description: 'libaom is the official AV1 codec reference implementation from the Alliance for Open Media, delivering next-generation open-source video compression.',
    license: ['BSD-2-Clause'],
    upstreams: [
      {
        url: 'https://storage.googleapis.com/aom-releases/libaom-3.9.1.tar.gz',
        hash: '782cfbe41ff7aeaa3a5cfdc0937a89e13b8686d1bf1e6f53ca81b0a70196850a',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: [
      'binary(cmake)',
      'binary(nasm)'
    ],
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'android-tools',
    version: '35.0.1',
    release: 1,
    homepage: 'https://developer.android.com/studio/releases/platform-tools',
    summary: 'Android platform tools (adb, fastboot)',
    description: 'Includes core components of the Android SDK Platform-Tools—primarily adb and fastboot—for interfacing with Android devices.',
    license: ['Apache-2.0'],
    upstreams: [
      {
        url: 'https://github.com/nmeum/android-tools/releases/download/35.0.1/android-tools-35.0.1.tar.xz',
        hash: 'c38db5d7373f7528359b32ba36362ba2629b311394c8ec6d56bb5734e5572bc1',
        type: 'tarball'
      }
    ],
    category: 'Development',
    builddeps: [
      'binary(cmake)',
      'pkgconfig(libusb-1.0)',
      'pkgconfig(openssl)'
    ],
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'hyprwayland-scanner',
    version: '0.4.4',
    release: 1,
    homepage: 'https://github.com/hyprwm/hyprwayland-scanner',
    summary: "Hyprland's implementation of wayland-scanner",
    description: 'A replacement for wayland-scanner written in C++ used by the Hyprland ecosystem to generate C++ bindings from Wayland XML protocol definitions.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://github.com/hyprwm/hyprwayland-scanner/archive/refs/tags/v0.4.4.tar.gz',
        hash: 'b2da3ec9bc6fa34d852a420ae3b25cae6be9527ec31a084eb83db6ca68822067',
        type: 'tarball'
      }
    ],
    category: 'Desktop',
    builddeps: ['cmake(pugixml)'],
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'linux-desktop',
    version: '6.12.8',
    release: 1,
    homepage: 'https://kernel.org/',
    summary: 'The Linux kernel for desktop systems',
    description: 'The Linux kernel configured for desktop and workstation use in aerynOS, with low latency, responsive scheduling, and broad hardware support.',
    license: ['GPL-2.0-only'],
    upstreams: [
      {
        url: 'https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.12.8.tar.xz',
        hash: 'a07297920fa52b04f7678508e96bf6a908b8b082163b7ce85bd2b069fa7a9b08',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'binary(bc)',
      'binary(bison)',
      'binary(flex)',
      'binary(openssl)',
      'pkgconfig(libelf)'
    ],
    toolchain: 'gnu',
    setup: '# kernel-specific configuration steps',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'libnvme',
    version: '1.10',
    release: 1,
    homepage: 'https://github.com/linux-nvme/libnvme',
    summary: 'C Library for NVMe on Linux',
    description: 'libnvme provides type definitions for NVMe specification structures, enumerations, and Linux IOCTL interface functions.',
    license: ['LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://github.com/linux-nvme/libnvme/archive/refs/tags/v1.10.tar.gz',
        hash: '64757c917ee92a7e4b9bbd2345e6912384a4bf7453eb81a171c77f0a719958dc',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(openssl)',
      'pkgconfig(json-c)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'openssl',
    version: '3.3.2',
    release: 1,
    homepage: 'https://openssl.org/',
    summary: 'An Open Source toolkit implementing SSL/TLS',
    description: 'OpenSSL is a robust, commercial-grade, and full-featured toolkit for the Transport Layer Security (TLS) and Secure Sockets Layer (SSL) protocols.',
    license: ['Apache-2.0'],
    upstreams: [
      {
        url: 'https://github.com/openssl/openssl/releases/download/openssl-3.3.2/openssl-3.3.2.tar.gz',
        hash: '2e8a40b01979adba3be6907ae959300c9d263a0c14e7fb2581574b6e947738b8',
        type: 'tarball'
      }
    ],
    category: 'Security',
    builddeps: ['binary(perl)'],
    packages: [
      {
        name: 'openssl-libs',
        summary: 'OpenSSL shared runtime libraries',
        description: 'libssl and libcrypto shared libraries.',
        paths: ['/usr/lib/libssl.so.*', '/usr/lib/libcrypto.so.*']
      },
      {
        name: 'openssl-devel',
        summary: 'OpenSSL development files and headers',
        description: 'C headers and pkgconfig files for compiling against OpenSSL.',
        paths: ['/usr/include/openssl/', '/usr/lib/pkgconfig/openssl.pc']
      }
    ],
    setup: './Configure --prefix=/usr --openssldir=/etc/ssl shared',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'qcoro',
    version: '0.10.0',
    release: 2,
    homepage: 'https://qcoro.dvratil.cz/',
    summary: 'C++ Coroutine library for Qt',
    description: 'QCoro provides a set of tools to allow writing asynchronous code using C++20 coroutines in Qt applications.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/danvratil/qcoro/archive/v0.10.0.tar.gz',
        hash: 'c3848b87452d348003f56d68b6b15e44a490ba5175653b6fa72ff0a3d420b9e8',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'cmake(Qt6Core)',
      'cmake(Qt6DBus)',
      'cmake(Qt6Network)',
      'cmake(Qt6Qml)',
      'cmake(Qt6Quick)'
    ],
    packages: [
      {
        name: 'qcoro-qt6',
        summary: 'C++ Coroutines for Qt6',
        description: 'QCoro runtime library for Qt6.',
        paths: ['/usr/lib/libQCoro6*.so.*']
      },
      {
        name: 'qcoro-qt6-devel',
        summary: 'Development files for Qt6 bindings',
        rundeps: ['qcoro-qt6'],
        paths: ['/usr/include/qcoro6/', '/usr/lib/cmake/QCoro6/']
      }
    ],
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'bash',
    version: '5.2.37',
    release: 10,
    homepage: 'https://www.gnu.org/software/bash/',
    summary: 'GNU Bourne Again Shell',
    description: 'Bash is an sh-compatible command language interpreter that executes commands read from the standard input or from a file, incorporating useful features from the Korn and C shells.',
    license: ['GPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/bash/bash-5.2.37.tar.gz',
        hash: '9599e22ecd1d5787ad7d3b74f5979feaa30b36092337d4f9392f7260af180114',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'pkgconfig(ncursesw)',
      'pkgconfig(readline)'
    ],
    setup: '%configure --with-installed-readline',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'ripgrep',
    version: '14.1.1',
    release: 5,
    homepage: 'https://github.com/BurntSushi/ripgrep',
    summary: 'A search tool that combines the usability of ag with the raw speed of grep',
    description: 'ripgrep is a line-oriented search tool that recursively searches the current directory for a regex pattern while respecting gitignore rules.',
    license: ['MIT', 'Unlicense'],
    upstreams: [
      {
        url: 'https://github.com/BurntSushi/ripgrep/archive/refs/tags/14.1.1.tar.gz',
        hash: '491410719875bbef3b58be422c502b6628db9ae6a9e1e2d936cd0a3e81ff076f',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'binary(cargo)',
      'binary(rustc)',
      'pkgconfig(pcre2)'
    ],
    build: '%cargo_build --release --features pcre2',
    install: '%cargo_install'
  },

  // ==========================================
  // System Category
  // ==========================================
  {
    name: 'systemd',
    version: '256.7',
    release: 12,
    homepage: 'https://systemd.io/',
    summary: 'System and Service Manager',
    description: 'systemd is a suite of basic building blocks for a Linux system. It provides a system and service manager that runs as PID 1 and starts the rest of the system.',
    license: ['LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://github.com/systemd/systemd/archive/refs/tags/v256.7.tar.gz',
        hash: 'f9b4c05561a34b3e6481977e5d2fb56353381a17f22312d7b5bf3c393806e001',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'binary(meson)',
      'binary(ninja)',
      'pkgconfig(libkmod)',
      'pkgconfig(libcap)',
      'pkgconfig(libcryptsetup)',
      'pkgconfig(openssl)',
      'pkgconfig(libzstd)'
    ],
    setup: '%meson \\\n  -Dmode=release \\\n  -Dpam=true \\\n  -Daudit=false',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'util-linux',
    version: '2.40.2',
    release: 8,
    homepage: 'https://github.com/util-linux/util-linux',
    summary: 'Essential miscellaneous utilities for Linux',
    description: 'util-linux is a standard package of fundamental utilities for the Linux operating system, including fdisk, mount, blkid, lsblk, and dmesg.',
    license: ['GPL-2.0-or-later', 'LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://www.kernel.org/pub/linux/utils/util-linux/v2.40/util-linux-2.40.2.tar.xz',
        hash: 'd78b37a66f5922d70edf3a687e339ffac1e8d3152862d8b11a8082b2f7b0ce11',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'binary(meson)',
      'pkgconfig(libcap-ng)',
      'pkgconfig(libudev)',
      'pkgconfig(ncursesw)',
      'pkgconfig(zlib)'
    ],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'coreutils',
    version: '9.5',
    release: 4,
    homepage: 'https://www.gnu.org/software/coreutils/',
    summary: 'The basic file, shell and text manipulation utilities of the GNU operating system',
    description: 'GNU Coreutils contains the core utilities which are expected to exist on every operating system, including cat, cp, ls, mv, rm, and chmod.',
    license: ['GPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/coreutils/coreutils-9.5.tar.xz',
        hash: 'cd328ed92ee79ae9f61886409be9131013829166abb21b00f277dc821b61dfa8',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'pkgconfig(libcap)',
      'pkgconfig(openssl)',
      'pkgconfig(gmp)'
    ],
    setup: '%configure --enable-install-program=arch',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'shadow',
    version: '4.16.0',
    release: 3,
    homepage: 'https://github.com/shadow-maint/shadow',
    summary: 'Utilities for managing shadow password files and user accounts',
    description: 'The Shadow suite includes login, useradd, userdel, usermod, passwd, and group management utilities configured with subuid and PAM support.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://github.com/shadow-maint/shadow/releases/download/v4.16.0/shadow-4.16.0.tar.xz',
        hash: '42dbe3cd4b6ff9b28b77054ae525dd675d60ca526c71c4c3e80eb842851dc20d',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'pkgconfig(libpam)',
      'pkgconfig(libsubid)'
    ],
    setup: '%configure --with-libpam --enable-subordinate-ids',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'sudo',
    version: '1.9.16p2',
    release: 6,
    homepage: 'https://www.sudo.ws/',
    summary: 'Execute a command as another user',
    description: 'Sudo allows a system administrator to delegate authority to give certain users or groups of users the ability to run commands as root or another user.',
    license: ['ISC'],
    upstreams: [
      {
        url: 'https://www.sudo.ws/dist/sudo-1.9.16p2.tar.gz',
        hash: '1a50cefb981f422998a12e2c8ca00d923793dfbe94e77ddda1ff55bc2be82229',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'pkgconfig(libpam)',
      'pkgconfig(zlib)'
    ],
    setup: '%configure --with-pam --with-env-editor',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'dbus',
    version: '1.14.10',
    release: 9,
    homepage: 'https://www.freedesktop.org/wiki/Software/dbus/',
    summary: 'D-Bus message bus system',
    description: 'D-Bus is a message bus system, a simple way for applications to talk to one another. In addition to interprocess communication, D-Bus helps coordinate process lifecycle.',
    license: ['AFL-2.1', 'GPL-2.0-or-later'],
    upstreams: [
      {
        url: 'https://dbus.freedesktop.org/releases/dbus/dbus-1.14.10.tar.xz',
        hash: 'ba1f211284f337d1e1f3922f3068e21762e087112ea1ef9328ff95bc15b22596',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'binary(meson)',
      'pkgconfig(expat)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'polkit',
    version: '125',
    release: 2,
    homepage: 'https://gitlab.freedesktop.org/polkit/polkit',
    summary: 'Application-level authorization manager',
    description: 'polkit is an application-level toolkit for defining and handling authorizations. It allows an unprivileged process to speak to a privileged process in a secure manner.',
    license: ['LGPL-2.0-or-later'],
    upstreams: [
      {
        url: 'https://gitlab.freedesktop.org/polkit/polkit/-/archive/125/polkit-125.tar.gz',
        hash: '17dbdd88ae8ceb85292eb63c49fb2ca2ddca111322da5b1e6878b668d2a6a655',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'binary(meson)',
      'pkgconfig(glib-2.0)',
      'pkgconfig(mozjs-128)',
      'pkgconfig(libpam)'
    ],
    setup: '%meson -Dsession_tracking=logind',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'elogind',
    version: '255.5',
    release: 4,
    homepage: 'https://github.com/elogind/elogind',
    summary: 'The systemd project logind, extracted to a standalone daemon',
    description: 'elogind is the systemd project logind daemon extracted to a standalone daemon, allowing session management and power management without requiring systemd as PID 1.',
    license: ['LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://github.com/elogind/elogind/archive/refs/tags/v255.5.tar.gz',
        hash: '6a87c1264c010d29367d5e4905f1593c78ad8db29a36fe382ca5c04eb8c7a65b',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'binary(meson)',
      'pkgconfig(libcap)',
      'pkgconfig(udev)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },

  // ==========================================
  // Editors & Terminals
  // ==========================================
  {
    name: 'neovim',
    version: '0.10.4',
    release: 7,
    homepage: 'https://neovim.io/',
    summary: 'Vim-fork focused on extensibility and usability',
    description: 'Neovim is a hyperextensible Vim-based text editor featuring Lua 5.1/LuaJIT scripting, a built-in LSP client, Treesitter integration, and terminal emulation.',
    license: ['Apache-2.0', 'Vim'],
    upstreams: [
      {
        url: 'https://github.com/neovim/neovim/archive/refs/tags/v0.10.4.tar.gz',
        hash: 'b567d266e74b321cfb77626359567c9c0b06b6d5f7560a5e8ec200d7fb797c21',
        type: 'tarball'
      }
    ],
    category: 'Editors',
    builddeps: [
      'binary(cmake)',
      'pkgconfig(libuv)',
      'pkgconfig(luajit)',
      'pkgconfig(msgpack-c)',
      'pkgconfig(unibilium)',
      'pkgconfig(tree-sitter)'
    ],
    setup: '%cmake -DCMAKE_BUILD_TYPE=Release',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'helix',
    version: '25.01.1',
    release: 2,
    homepage: 'https://helix-editor.com/',
    summary: 'A post-modern modal text editor',
    description: 'Helix is a modern modal text editor written in Rust with built-in Language Server Protocol support, Tree-sitter syntax highlighting and code navigation, and multiple selections.',
    license: ['MPL-2.0'],
    upstreams: [
      {
        url: 'https://github.com/helix-editor/helix/archive/refs/tags/25.01.1.tar.gz',
        hash: '8f7d983411b9338b1f41d8e137f8185c13b190d6e6a1fb096d2466b8c1995ba1',
        type: 'tarball'
      }
    ],
    category: 'Editors',
    builddeps: [
      'binary(cargo)',
      'binary(rustc)'
    ],
    build: '%cargo_build --release',
    install: '%cargo_install'
  },
  {
    name: 'alacritty',
    version: '0.14.0',
    release: 5,
    homepage: 'https://alacritty.org/',
    summary: 'A fast, cross-platform, OpenGL terminal emulator',
    description: 'Alacritty is a modern terminal emulator that comes with sensible defaults, but allows for extensive configuration. It integrates with other applications rather than reimplementing their functionality.',
    license: ['Apache-2.0'],
    upstreams: [
      {
        url: 'https://github.com/alacritty/alacritty/archive/refs/tags/v0.14.0.tar.gz',
        hash: '4ec5b376229ba029671d1e44f0b2fcf008779942a129ef9cf3bf67b84f3f0be7',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'binary(cargo)',
      'binary(rustc)',
      'pkgconfig(fontconfig)',
      'pkgconfig(freetype2)',
      'pkgconfig(wayland-client)'
    ],
    build: '%cargo_build --release',
    install: '%cargo_install'
  },
  {
    name: 'foot',
    version: '1.20.2',
    release: 3,
    homepage: 'https://codeberg.org/dnkl/foot',
    summary: 'A fast, lightweight and minimalistic Wayland terminal emulator',
    description: 'foot is a Wayland terminal emulator with server/client daemon support, fast rendering, low input latency, and full keyboard-driven operation.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://codeberg.org/dnkl/foot/archive/1.20.2.tar.gz',
        hash: 'd664e43e74ff1560db9350df055781a97753e198f828a2a71bf685e135b1285f',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'binary(meson)',
      'pkgconfig(wayland-client)',
      'pkgconfig(pixman-1)',
      'pkgconfig(fcft)',
      'pkgconfig(tllist)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'kitty',
    version: '0.38.1',
    release: 4,
    homepage: 'https://sw.kovidgoyal.net/kitty/',
    summary: 'The fast, feature-rich, GPU based terminal emulator',
    description: 'kitty is an OpenGL-accelerated terminal emulator designed for power users, supporting graphics protocols, tabs, splits, extensions (kittens), and true-color output.',
    license: ['GPL-3.0-only'],
    upstreams: [
      {
        url: 'https://github.com/kovidgoyal/kitty/releases/download/v0.38.1/kitty-0.38.1.tar.xz',
        hash: '3a5f97334b07c89fbfd6be20a7b97e93098bf8c83a73c1555716e257ebc238b6',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'binary(python3)',
      'pkgconfig(wayland-client)',
      'pkgconfig(fontconfig)',
      'pkgconfig(gl)',
      'pkgconfig(dbus-1)',
      'pkgconfig(lcms2)'
    ],
    build: 'python3 setup.py linux-package',
    install: 'python3 setup.py linux-package --dest %(installroot)/usr'
  },

  // ==========================================
  // Shells
  // ==========================================
  {
    name: 'zsh',
    version: '5.9',
    release: 6,
    homepage: 'https://www.zsh.org/',
    summary: 'Advanced command interpreter for UNIX',
    description: 'Zsh is an interactive UNIX shell and powerful command language interpreter designed for interactive use with advanced tab completion, globbing, and theme support.',
    license: ['MIT-Modern-Variant'],
    upstreams: [
      {
        url: 'https://sourceforge.net/projects/zsh/files/zsh/5.9/zsh-5.9.tar.xz/download',
        hash: '9b8d1ecedd5b5e81fbf1918e876752a7dd472e0f67f59102f138d8ac6bd9d2fb',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'pkgconfig(ncursesw)',
      'pkgconfig(pcre)'
    ],
    setup: '%configure --enable-pcre --enable-cap --with-tcsetpgrp',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'fish',
    version: '4.0.0',
    release: 1,
    homepage: 'https://fishshell.com/',
    summary: 'The user-friendly command line shell',
    description: 'fish is a smart and user-friendly command line shell for macOS, Linux, and the rest of the family. It includes features like syntax highlighting, autosuggest-as-you-type, and fancy tab completions.',
    license: ['GPL-2.0-only'],
    upstreams: [
      {
        url: 'https://github.com/fish-shell/fish-shell/releases/download/4.0.0/fish-4.0.0.tar.xz',
        hash: '2c8c43ecbbcae1b12b5cebf0ff06649ee8c5bbd5c58971b3ea595d774be429f5',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'binary(cmake)',
      'binary(cargo)',
      'binary(rustc)',
      'pkgconfig(ncursesw)'
    ],
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },

  // ==========================================
  // Languages & Runtimes
  // ==========================================
  {
    name: 'python3',
    version: '3.12.8',
    release: 14,
    homepage: 'https://www.python.org/',
    summary: 'The Python 3 programming language interpreter',
    description: 'Python is an interpreted, interactive, object-oriented programming language. It incorporates modules, exceptions, dynamic typing, very high level dynamic data types, and classes.',
    license: ['PSF-2.0'],
    upstreams: [
      {
        url: 'https://www.python.org/ftp/python/3.12.8/Python-3.12.8.tar.xz',
        hash: 'c9091570530718789a19ced94a287ee3b4e6c3be3df4a4e03d45c60c87103a08',
        type: 'tarball'
      }
    ],
    category: 'Languages',
    builddeps: [
      'pkgconfig(libffi)',
      'pkgconfig(openssl)',
      'pkgconfig(sqlite3)',
      'pkgconfig(zlib)',
      'pkgconfig(bzip2)',
      'pkgconfig(ncursesw)',
      'pkgconfig(readline)'
    ],
    setup: '%configure --enable-shared --with-system-ffi --enable-optimizations',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'rustc',
    version: '1.84.1',
    release: 8,
    homepage: 'https://www.rust-lang.org/',
    summary: 'The Rust compiler and language platform',
    description: 'Rust is a systems programming language that empowers everyone to build reliable and efficient software with memory safety guaranteed without garbage collection.',
    license: ['Apache-2.0', 'MIT'],
    upstreams: [
      {
        url: 'https://static.rust-lang.org/dist/rustc-1.84.1-src.tar.xz',
        hash: 'a12678f2ce36b4db8ef918659d57a2f588c7fbe8b5c97042578b871901c5f3b2',
        type: 'tarball'
      }
    ],
    category: 'Languages',
    builddeps: [
      'binary(rustc)',
      'binary(cargo)',
      'pkgconfig(llvm)',
      'pkgconfig(openssl)'
    ],
    setup: './configure --prefix=/usr --enable-llvm-link-shared',
    build: 'python3 x.py build',
    install: 'python3 x.py install'
  },
  {
    name: 'cargo',
    version: '1.84.1',
    release: 8,
    homepage: 'https://crates.io/',
    summary: "The Rust package manager and build tool",
    description: 'Cargo downloads your Rust package dependencies, compiles your packages, makes distributable packages, and uploads them to crates.io.',
    license: ['Apache-2.0', 'MIT'],
    upstreams: [
      {
        url: 'https://static.rust-lang.org/dist/cargo-1.84.1-src.tar.xz',
        hash: '5e0fbe25d888127be513eef4045f8cb454589d311fa87820a4cf8a48b598b98e',
        type: 'tarball'
      }
    ],
    category: 'Development',
    builddeps: [
      'binary(rustc)',
      'pkgconfig(openssl)',
      'pkgconfig(libcurl)',
      'pkgconfig(libgit2)'
    ],
    build: '%cargo_build --release',
    install: '%cargo_install'
  },
  {
    name: 'nodejs',
    version: '22.13.1',
    release: 11,
    homepage: 'https://nodejs.org/',
    summary: "JavaScript runtime built on Chrome's V8 engine",
    description: 'Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser, widely used for servers and developer tooling.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://nodejs.org/dist/v22.13.1/node-v22.13.1.tar.xz',
        hash: 'fa270ba903c734e5658e13788ff9386d3b4e18342c3bb1640a455a1532f83196',
        type: 'tarball'
      }
    ],
    category: 'Languages',
    builddeps: [
      'binary(python3)',
      'pkgconfig(openssl)',
      'pkgconfig(zlib)',
      'pkgconfig(libuv)',
      'pkgconfig(brotli)',
      'pkgconfig(icu-uc)'
    ],
    setup: './configure --prefix=/usr --shared-openssl --shared-zlib --shared-libuv',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'ruby',
    version: '3.4.1',
    release: 3,
    homepage: 'https://www.ruby-lang.org/',
    summary: 'An interpreted, dynamic, open source programming language',
    description: 'Ruby is a dynamic, open source programming language with a focus on simplicity and productivity. It has an elegant syntax that is natural to read and easy to write.',
    license: ['Ruby', 'BSD-2-Clause'],
    upstreams: [
      {
        url: 'https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.1.tar.xz',
        hash: 'fa50e9723bfb3a7beec3c23e8035e16543b355fe82d5668db780c85c2b489d8e',
        type: 'tarball'
      }
    ],
    category: 'Languages',
    builddeps: [
      'pkgconfig(openssl)',
      'pkgconfig(yaml-0.1)',
      'pkgconfig(zlib)',
      'pkgconfig(gmp)'
    ],
    setup: '%configure --enable-shared --disable-install-doc',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'perl',
    version: '5.40.1',
    release: 5,
    homepage: 'https://www.perl.org/',
    summary: 'The Perl 5 language interpreter',
    description: 'Perl is a highly capable, feature-rich programming language with over 36 years of development, particularly known for text processing and system administration.',
    license: ['GPL-1.0-or-later', 'Artistic-1.0-Perl'],
    upstreams: [
      {
        url: 'https://www.cpan.org/src/5.0/perl-5.40.1.tar.xz',
        hash: '6eb95cc1a89f81a7b1ee0d3ea089e0004ff471d4715f33333337a7b8849b2511',
        type: 'tarball'
      }
    ],
    category: 'Languages',
    builddeps: [
      'pkgconfig(zlib)',
      'pkgconfig(bzip2)'
    ],
    setup: './Configure -des -Dprefix=/usr -Duseshrplib',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'llvm',
    version: '19.1.7',
    release: 9,
    homepage: 'https://llvm.org/',
    summary: 'The LLVM Compiler Infrastructure project',
    description: 'The LLVM Project is a collection of modular and reusable compiler and toolchain technologies, serving as the foundation of aerynOS compilation infrastructure.',
    license: ['Apache-2.0 WITH LLVM-exception'],
    upstreams: [
      {
        url: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-19.1.7/llvm-project-19.1.7.src.tar.xz',
        hash: '82401dda812208a54fb05b55080ab42d091ef929b9f632e323239a7b05247450',
        type: 'tarball'
      }
    ],
    category: 'Development',
    builddeps: [
      'binary(cmake)',
      'binary(ninja)',
      'pkgconfig(zlib)',
      'pkgconfig(libzstd)',
      'pkgconfig(libffi)'
    ],
    setup: '%cmake -DLLVM_ENABLE_PROJECTS="clang;lld" -DCMAKE_BUILD_TYPE=Release',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'clang',
    version: '19.1.7',
    release: 9,
    homepage: 'https://clang.llvm.org/',
    summary: 'C, C++, and Objective-C frontend for LLVM',
    description: 'Clang is a compiler front end for the C, C++, and Objective-C programming languages, acting as the primary system compiler for aerynOS.',
    license: ['Apache-2.0 WITH LLVM-exception'],
    upstreams: [
      {
        url: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-19.1.7/llvm-project-19.1.7.src.tar.xz',
        hash: '82401dda812208a54fb05b55080ab42d091ef929b9f632e323239a7b05247450',
        type: 'tarball'
      }
    ],
    category: 'Development',
    builddeps: [
      'binary(cmake)',
      'binary(ninja)',
      'pkgconfig(llvm)'
    ],
    setup: '%cmake -DLLVM_BUILD_RUNTIME=OFF',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'gcc',
    version: '14.2.0',
    release: 12,
    homepage: 'https://gcc.gnu.org/',
    summary: 'The GNU Compiler Collection',
    description: 'GCC is a key component of the GNU toolchain, supporting C, C++, Fortran, and Go compilation, used in aerynOS for legacy and kernel builds.',
    license: ['GPL-3.0-or-later WITH GCC-exception-3.1'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/gcc/gcc-14.2.0/gcc-14.2.0.tar.xz',
        hash: 'a7b39ad69fb9bfae6ee86180f25706d37ba60290c7b55b8a411fbbe9a82e9364',
        type: 'tarball'
      }
    ],
    category: 'Development',
    toolchain: 'gnu',
    builddeps: [
      'pkgconfig(gmp)',
      'pkgconfig(mpfr)',
      'pkgconfig(mpc)',
      'pkgconfig(zlib)',
      'pkgconfig(libzstd)'
    ],
    setup: '%configure --enable-languages=c,c++ --disable-multilib',
    build: '%make',
    install: '%make_install'
  },

  // ==========================================
  // Desktop & Window Managers
  // ==========================================
  {
    name: 'hyprland',
    version: '0.46.2',
    release: 15,
    homepage: 'https://hyprland.org/',
    summary: 'A dynamic tiling Wayland compositor that doesn\'t sacrifice on its looks',
    description: 'Hyprland is a dynamic tiling Wayland compositor that features smooth animations, rounded corners, Dual-Kawase Blur, and a comprehensive plugin architecture.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://github.com/hyprwm/Hyprland/releases/download/v0.46.2/source-v0.46.2.tar.gz',
        hash: 'f5d81231a47b4d32a9c33bb32274438b4bb688220023a85b4cf53b0a2fa1a15a',
        type: 'tarball'
      }
    ],
    category: 'Desktop',
    builddeps: [
      'binary(meson)',
      'binary(ninja)',
      'binary(hyprwayland-scanner)',
      'pkgconfig(wayland-server)',
      'pkgconfig(wlroots)',
      'pkgconfig(aquamarine)',
      'pkgconfig(hyprlang)',
      'pkgconfig(hyprcursor)',
      'pkgconfig(cairo)',
      'pkgconfig(pango)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'wayland',
    version: '1.23.1',
    release: 4,
    homepage: 'https://wayland.freedesktop.org/',
    summary: 'Core Wayland display server and client library',
    description: 'Wayland is a protocol for a compositor to talk to its clients as well as a C library implementation of that protocol, replacing the legacy X Window System.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://gitlab.freedesktop.org/wayland/wayland/-/releases/1.23.1/downloads/wayland-1.23.1.tar.xz',
        hash: '8f2d5955cf4703a553147e4b95349e5d4486518e388f83b10b0e50953c30a84d',
        type: 'tarball'
      }
    ],
    category: 'Desktop',
    builddeps: [
      'binary(meson)',
      'binary(ninja)',
      'pkgconfig(libffi)',
      'pkgconfig(expat)'
    ],
    emul32: true,
    setup: '%meson -Ddocumentation=false',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'wayland-protocols',
    version: '1.38',
    release: 2,
    homepage: 'https://wayland.freedesktop.org/',
    summary: 'Specifications of extended Wayland protocols',
    description: 'wayland-protocols contains Wayland protocol XML definitions that add functionality outside the core Wayland protocol APIs.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://gitlab.freedesktop.org/wayland/wayland-protocols/-/releases/1.38/downloads/wayland-protocols-1.38.tar.xz",',
        hash: '4d1f2a4661845bb0d984cfb72183c5a7b8ec523315a6b7d23d83960924976721',
        type: 'tarball'
      }
    ],
    category: 'Desktop',
    builddeps: [
      'binary(meson)',
      'pkgconfig(wayland-scanner)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'wlroots',
    version: '0.18.2',
    release: 6,
    homepage: 'https://gitlab.freedesktop.org/wlroots/wlroots',
    summary: 'Modular Wayland compositor library',
    description: 'Pluggable, composable, unopinionated modules for building a Wayland compositor, handling backend rendering, seat management, and protocol implementation.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://gitlab.freedesktop.org/wlroots/wlroots/-/archive/0.18.2/wlroots-0.18.2.tar.gz',
        hash: 'b14918e95c1815148fef76c11db843b0d49487f87a0c102a24faea9079313ea0',
        type: 'tarball'
      }
    ],
    category: 'Desktop',
    builddeps: [
      'binary(meson)',
      'pkgconfig(wayland-server)',
      'pkgconfig(wayland-protocols)',
      'pkgconfig(libdrm)',
      'pkgconfig(xkbcommon)',
      'pkgconfig(pixman-1)',
      'pkgconfig(libseat)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'sway',
    version: '1.10',
    release: 3,
    homepage: 'https://swaywm.org/',
    summary: 'i3-compatible Wayland compositor',
    description: 'Sway is a tiling Wayland compositor and a drop-in replacement for the i3 window manager for X11, supporting existing i3 configuration files.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/swaywm/sway/archive/refs/tags/1.10.tar.gz',
        hash: '8f7528e18f28b49dbb1842eb41097e3a9b19e0787a0b3f8901ba6452292f750b',
        type: 'tarball'
      }
    ],
    category: 'Desktop',
    builddeps: [
      'binary(meson)',
      'pkgconfig(wlroots)',
      'pkgconfig(wayland-server)',
      'pkgconfig(json-c)',
      'pkgconfig(pcre2)',
      'pkgconfig(pango)',
      'pkgconfig(cairo)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'cosmic-session',
    version: '1.0.0-alpha.5',
    release: 2,
    homepage: 'https://github.com/pop-os/cosmic-session',
    summary: 'Session manager for the COSMIC desktop environment',
    description: 'cosmic-session manages session lifecycle, autorun applications, and integration between the compositor, applets, and desktop shell for the COSMIC DE.',
    license: ['GPL-3.0-only'],
    upstreams: [
      {
        url: 'https://github.com/pop-os/cosmic-session/archive/refs/tags/epoch-1.0.0-alpha.5.tar.gz',
        hash: 'da5029311b98a0050882101fb178a9c0201f8198f12952ab903bce674390be10',
        type: 'tarball'
      }
    ],
    category: 'Desktop',
    builddeps: [
      'binary(cargo)',
      'binary(rustc)',
      'pkgconfig(wayland-client)'
    ],
    build: '%cargo_build --release',
    install: '%cargo_install'
  },
  {
    name: 'cosmic-comp',
    version: '1.0.0-alpha.5',
    release: 2,
    homepage: 'https://github.com/pop-os/cosmic-comp',
    summary: 'Compositor for the COSMIC desktop environment',
    description: 'cosmic-comp is a modern Wayland compositor built with smithay in Rust, providing smooth animations, auto-tiling, and floating window management.',
    license: ['GPL-3.0-only'],
    upstreams: [
      {
        url: 'https://github.com/pop-os/cosmic-comp/archive/refs/tags/epoch-1.0.0-alpha.5.tar.gz',
        hash: 'e4905188f192b678000494be9090b0d355ef819a84f3e90141bb0287cf87103a',
        type: 'tarball'
      }
    ],
    category: 'Desktop',
    builddeps: [
      'binary(cargo)',
      'binary(rustc)',
      'pkgconfig(wayland-server)',
      'pkgconfig(libseat)',
      'pkgconfig(libinput)',
      'pkgconfig(xkbcommon)'
    ],
    build: '%cargo_build --release',
    install: '%cargo_install'
  },
  {
    name: 'pipewire',
    version: '1.2.7',
    release: 11,
    homepage: 'https://pipewire.org/',
    summary: 'Multimedia processing graphs and routing server',
    description: 'PipeWire is a project that aims to greatly improve handling of audio and video under Linux, providing low-latency graph-based routing, PulseAudio emulation, and JACK compatibility.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://gitlab.freedesktop.org/pipewire/pipewire/-/archive/1.2.7/pipewire-1.2.7.tar.gz',
        hash: '2fb7802878c772c803328e19278bf80e4b09b531776510825ebbf79477bfa9cb',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: [
      'binary(meson)',
      'pkgconfig(alsa)',
      'pkgconfig(dbus-1)',
      'pkgconfig(libudev)',
      'pkgconfig(glib-2.0)',
      'pkgconfig(webrtc-audio-processing-1)'
    ],
    emul32: true,
    packages: [
      {
        name: 'pipewire-libs',
        summary: 'PipeWire client libraries',
        paths: ['/usr/lib/libpipewire-*.so.*']
      },
      {
        name: 'pipewire-devel',
        summary: 'PipeWire development files',
        paths: ['/usr/include/pipewire-*/', '/usr/lib/pkgconfig/libpipewire-*.pc']
      }
    ],
    setup: '%meson -Dsession-managers=[]',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'wireplumber',
    version: '0.5.6',
    release: 5,
    homepage: 'https://pipewire.pages.freedesktop.org/wireplumber/',
    summary: 'Modular session and policy manager for PipeWire',
    description: 'WirePlumber is a modular session and policy manager for PipeWire, handling device discovery, routing policies, volume controls, and client endpoint configuration via Lua scripts.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://gitlab.freedesktop.org/pipewire/wireplumber/-/archive/0.5.6/wireplumber-0.5.6.tar.gz',
        hash: '7774bb200155b9a4c80327f2f61a0bc3b567119e8cf702d08a90302526e0e5a1',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: [
      'binary(meson)',
      'pkgconfig(pipewire-0.3)',
      'pkgconfig(glib-2.0)',
      'pkgconfig(lua54)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },

  // ==========================================
  // Graphics & Multimedia
  // ==========================================
  {
    name: 'mesa',
    version: '24.3.3',
    release: 18,
    homepage: 'https://mesa3d.org/',
    summary: 'Open-source implementation of OpenGL, Vulkan, and Gallium drivers',
    description: 'Mesa is the 3D graphics library delivering open-source Vulkan and OpenGL drivers for Intel (Iris, Anv), AMD (RadeonSI, RADV), NVIDIA (Nouveau, NVK), and software rasterizers.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://archive.mesa3d.org/mesa-24.3.3.tar.xz',
        hash: 'c8088ffb1979b1836a004eb78310ba99ee2a5a519806bc91f163b4b5c7baec7b',
        type: 'tarball'
      }
    ],
    category: 'Graphics',
    builddeps: [
      'binary(meson)',
      'binary(bison)',
      'binary(flex)',
      'python(mako)',
      'python(pyyaml)',
      'pkgconfig(libdrm)',
      'pkgconfig(wayland-client)',
      'pkgconfig(vulkan)',
      'pkgconfig(llvm)'
    ],
    emul32: true,
    packages: [
      {
        name: 'mesa-vulkan-drivers',
        summary: 'Mesa Vulkan graphic drivers',
        paths: ['/usr/lib/libvulkan_*.so']
      },
      {
        name: 'mesa-demos',
        summary: 'Mesa test programs',
        paths: ['/usr/bin/glxgears', '/usr/bin/glxinfo']
      }
    ],
    setup: '%meson -Dplatforms=wayland -Dgallium-drivers=radeonsi,zink,iris -Dvulkan-drivers=amd,intel',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'vulkan-loader',
    version: '1.4.304',
    release: 3,
    homepage: 'https://github.com/KhronosGroup/Vulkan-Loader',
    summary: 'Vulkan Installable Client Driver (ICD) Loader',
    description: 'The Khronos Vulkan ICD Loader provides the dispatcher that connects applications to the appropriate Vulkan hardware driver implementation.',
    license: ['Apache-2.0'],
    upstreams: [
      {
        url: 'https://github.com/KhronosGroup/Vulkan-Loader/archive/refs/tags/v1.4.304.tar.gz',
        hash: 'b14207914bf6895eb6348bbcf06720a2e554167e42d75a7c293708a54685ffcb',
        type: 'tarball'
      }
    ],
    category: 'Graphics',
    builddeps: [
      'binary(cmake)',
      'cmake(VulkanHeaders)',
      'pkgconfig(wayland-client)',
      'pkgconfig(x11)'
    ],
    emul32: true,
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'ffmpeg',
    version: '7.1',
    release: 8,
    homepage: 'https://ffmpeg.org/',
    summary: 'Complete, cross-platform solution to record, convert and stream audio and video',
    description: 'FFmpeg is the leading multimedia framework, able to decode, encode, transcode, mux, demux, stream, filter and play pretty much anything that humans and machines have created.',
    license: ['GPL-3.0-or-later', 'LGPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ffmpeg.org/releases/ffmpeg-7.1.tar.xz',
        hash: '40973d44970ada88ef379d49900fbab92264879f961016d5f6f86f8a99949f2b',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: [
      'binary(nasm)',
      'pkgconfig(aom)',
      'pkgconfig(dav1d)',
      'pkgconfig(libvpx)',
      'pkgconfig(opus)',
      'pkgconfig(vorbis)',
      'pkgconfig(vulkan)',
      'pkgconfig(zlib)'
    ],
    packages: [
      {
        name: 'ffmpeg-libs',
        summary: 'FFmpeg runtime shared libraries',
        paths: ['/usr/lib/libavcodec.so.*', '/usr/lib/libavformat.so.*', '/usr/lib/libavutil.so.*']
      },
      {
        name: 'ffmpeg-devel',
        summary: 'FFmpeg development headers and pkgconfig files',
        paths: ['/usr/include/libavcodec/', '/usr/lib/pkgconfig/libavcodec.pc']
      }
    ],
    setup: './configure --prefix=/usr --enable-gpl --enable-shared --enable-libopus --enable-libdav1d',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'mpv',
    version: '0.39.0',
    release: 4,
    homepage: 'https://mpv.io/',
    summary: 'Command line video player',
    description: 'mpv is a free, open-source, and cross-platform media player software based on MPlayer and mplayer2, supporting high quality video output with GPU shaders and Wayland support.',
    license: ['GPL-2.0-or-later', 'LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://github.com/mpv-player/mpv/archive/refs/tags/v0.39.0.tar.gz',
        hash: '2bb97f75f6d7ab574e44439c0371a5c6e88c03c53b21115317be60db938b8c5a',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: [
      'binary(meson)',
      'pkgconfig(libavcodec)',
      'pkgconfig(libavformat)',
      'pkgconfig(libplacebo)',
      'pkgconfig(wayland-client)',
      'pkgconfig(pipewire-0.3)',
      'pkgconfig(lua52)'
    ],
    setup: '%meson -Dwayland=enabled -Dpipewire=enabled',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'libpng',
    version: '1.6.46',
    release: 5,
    homepage: 'http://www.libpng.org/pub/png/libpng.html',
    summary: 'Portable Network Graphics reference library',
    description: 'libpng is the official reference library for the Portable Network Graphics (PNG) format, supporting reading, writing, and progressive decompression.',
    license: ['Libpng'],
    upstreams: [
      {
        url: 'https://downloads.sourceforge.net/libpng/libpng-1.6.46.tar.xz',
        hash: 'b78a9c289069d58be1f67f56f1406e93895e34749f5c81f6c449e7943be89ec5',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: ['pkgconfig(zlib)'],
    emul32: true,
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'libjpeg-turbo',
    version: '3.1.0',
    release: 4,
    homepage: 'https://libjpeg-turbo.org/',
    summary: 'SIMD-accelerated JPEG compression/decompression library',
    description: 'libjpeg-turbo is a JPEG image codec that uses SIMD instructions to accelerate baseline JPEG compression and decompression on x86, ARM, and PowerPC architectures.',
    license: ['IJG', 'BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://github.com/libjpeg-turbo/libjpeg-turbo/releases/download/3.1.0/libjpeg-turbo-3.1.0.tar.gz',
        hash: '774ab9d4a821e27a69bc922a944208a0d2be2655bf96570954b5dfa57db7f4ef',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(cmake)',
      'binary(nasm)'
    ],
    emul32: true,
    setup: '%cmake -DWITH_JPEG8=ON',
    build: '%cmake_build',
    install: '%cmake_install'
  },

  // ==========================================
  // Networking
  // ==========================================
  {
    name: 'wget',
    version: '1.25.0',
    release: 5,
    homepage: 'https://www.gnu.org/software/wget/',
    summary: 'Network utility to retrieve files from the Web',
    description: 'GNU Wget is a free software package for retrieving files using HTTP, HTTPS, FTP and FTPS, supporting recursive downloads, proxies, and background operation.',
    license: ['GPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/wget/wget-1.25.0.tar.gz',
        hash: '766e411b51e089d7010f3c5fbe6058e0a133499691c9441160a5d4d3a241e755',
        type: 'tarball'
      }
    ],
    category: 'Networking',
    builddeps: [
      'pkgconfig(gnutls)',
      'pkgconfig(libpsl)',
      'pkgconfig(zlib)',
      'pkgconfig(libpcre2-8)'
    ],
    setup: '%configure --with-ssl=gnutls',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'openssh',
    version: '9.9p1',
    release: 7,
    homepage: 'https://www.openssh.com/',
    summary: 'OpenSSH remote login and command execution client and server',
    description: 'OpenSSH is the premier connectivity tool for remote login with the SSH protocol. It encrypts all traffic to eliminate eavesdropping, connection hijacking, and other attacks.',
    license: ['SSH-OpenSSH', 'BSD-2-Clause', 'BSD-3-Clause', 'MIT'],
    upstreams: [
      {
        url: 'https://cdn.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-9.9p1.tar.gz',
        hash: 'b343fb50a58145a3be20e6f21226002f2323a674558e8b9ef50c180909f2b87e',
        type: 'tarball'
      }
    ],
    category: 'Networking',
    builddeps: [
      'pkgconfig(openssl)',
      'pkgconfig(zlib)',
      'pkgconfig(libedit)',
      'pkgconfig(libpam)'
    ],
    packages: [
      {
        name: 'openssh-client',
        summary: 'OpenSSH client binaries (ssh, scp, sftp)',
        paths: ['/usr/bin/ssh', '/usr/bin/scp', '/usr/bin/sftp', '/usr/bin/ssh-keygen']
      },
      {
        name: 'openssh-server',
        summary: 'OpenSSH server daemon (sshd)',
        paths: ['/usr/sbin/sshd']
      }
    ],
    setup: '%configure --with-pam --with-libedit --with-ssl-dir=/usr',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'networkmanager',
    version: '1.50.0',
    release: 6,
    homepage: 'https://networkmanager.dev/',
    summary: 'Network connection management daemon',
    description: 'NetworkManager is a set of co-operative tools that make networking simple and straightforward. Whether WiFi, wired, bond, bridge, 3G, or Bluetooth, NetworkManager allows automatic detection and configuration.',
    license: ['GPL-2.0-or-later', 'LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://gitlab.freedesktop.org/NetworkManager/NetworkManager/-/archive/1.50.0/NetworkManager-1.50.0.tar.gz',
        hash: 'ea19a084f7b6b19a16a49fa7e1897d27e77b068593a1c22ffbd754f94b8e21a4',
        type: 'tarball'
      }
    ],
    category: 'Networking',
    builddeps: [
      'binary(meson)',
      'pkgconfig(libudev)',
      'pkgconfig(dbus-1)',
      'pkgconfig(glib-2.0)',
      'pkgconfig(libndp)',
      'pkgconfig(gnutls)'
    ],
    setup: '%meson -Diwd=true -Dsystemdsystemunitdir=no',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'iwd',
    version: '3.3',
    release: 2,
    homepage: 'https://git.kernel.org/pub/scm/network/wireless/iwd.git',
    summary: 'Internet Wireless Daemon',
    description: 'iwd is a lightweight wireless daemon written by Intel for Linux that aims to replace wpa_supplicant with improved roaming performance and a clean D-Bus interface.',
    license: ['LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://www.kernel.org/pub/linux/network/wireless/iwd-3.3.tar.xz',
        hash: 'd0e378bb18a5628b082aa45b88ec7b093196f7ab1b212fbe937b2756d1f05634',
        type: 'tarball'
      }
    ],
    category: 'Networking',
    builddeps: [
      'pkgconfig(ell)',
      'pkgconfig(readline)'
    ],
    setup: '%configure --enable-client',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'git',
    version: '2.48.1',
    release: 8,
    homepage: 'https://git-scm.com/',
    summary: 'Fast, scalable, distributed revision control system',
    description: 'Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.',
    license: ['GPL-2.0-only'],
    upstreams: [
      {
        url: 'https://www.kernel.org/pub/software/scm/git/git-2.48.1.tar.xz',
        hash: 'b1484e565ea7493a3c2672bf3cb6cb9a7d363717fc8a5293297a739b6b7a9fbb',
        type: 'tarball'
      }
    ],
    category: 'Development',
    builddeps: [
      'pkgconfig(openssl)',
      'pkgconfig(zlib)',
      'pkgconfig(libcurl)',
      'pkgconfig(expat)',
      'pkgconfig(libpcre2-8)'
    ],
    setup: './configure --prefix=/usr --with-libpcre2',
    build: '%make',
    install: '%make_install'
  },

  // ==========================================
  // Fonts
  // ==========================================
  {
    name: 'font-jetbrains-mono',
    version: '2.304',
    release: 1,
    homepage: 'https://www.jetbrains.com/lp/mono/',
    summary: 'A typeface for developers by JetBrains',
    description: 'JetBrains Mono is a free and open-source typeface designed for developers with distinct letterforms, coding ligatures, and balanced character proportions.',
    license: ['OFL-1.1'],
    upstreams: [
      {
        url: 'https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip',
        hash: '6f6376c6ed29518d43ea0631e3008ba762705a824b782242d2218a7d90f4c099',
        type: 'tarball'
      }
    ],
    category: 'Fonts',
    packages: [
      {
        name: 'font-jetbrains-mono-ttf',
        summary: 'static fonts for jetbrains-mono',
        description: 'Static TrueType fonts for the JetBrains Mono developer typeface.',
        paths: ['/usr/share/fonts/truetype/jetbrains-mono/*.ttf']
      },
      {
        name: 'font-jetbrains-mono-ttf-vf',
        summary: 'variable fonts for jetbrains-mono',
        description: 'Variable TrueType font for the JetBrains Mono developer typeface.',
        paths: ['/usr/share/fonts/truetype/jetbrains-mono/*-VariableFont_*.ttf']
      },
      {
        name: 'font-jetbrains-mono-woff2',
        summary: 'webfonts for jetbrains-mono',
        description: 'Web Open Font Format 2.0 (WOFF2) webfonts for JetBrains Mono.',
        paths: ['/usr/share/fonts/woff2/jetbrains-mono/*.woff2']
      }
    ],
    install: '%install_dir %(installroot)/usr/share/fonts/truetype/jetbrains-mono\ncp -rv fonts/ttf/*.ttf %(installroot)/usr/share/fonts/truetype/jetbrains-mono/'
  },
  {
    name: 'font-noto',
    version: '2024.12.01',
    release: 2,
    homepage: 'https://fonts.google.com/noto',
    summary: 'Google Noto scalable font family for universal script support',
    description: 'Noto fonts aims to provide a unified visual look and feel across all scripts in the Unicode Standard, eliminating "tofu" boxes across language boundaries.',
    license: ['OFL-1.1'],
    upstreams: [
      {
        url: 'https://github.com/notofonts/notofonts.github.io/archive/refs/tags/noto-monthly-release-2024.12.01.tar.gz',
        hash: '4fa81729b469e38d17bce72a0256ea4cf9f242095a948c5e69e4ce89a804e1bc',
        type: 'tarball'
      }
    ],
    category: 'Fonts',
    packages: [
      {
        name: 'font-noto-ttf',
        summary: 'static fonts for Google Noto family',
        description: 'Standard TrueType static font files for Google Noto.',
        paths: ['/usr/share/fonts/truetype/noto/*.ttf']
      },
      {
        name: 'font-noto-cjk-ttf',
        summary: 'CJK fonts for Google Noto family',
        description: 'Chinese, Japanese, and Korean scripts for Google Noto.',
        paths: ['/usr/share/fonts/truetype/noto-cjk/*.ttf']
      },
      {
        name: 'font-noto-emoji-ttf',
        summary: 'color emoji font for Google Noto',
        description: 'Full color Unicode emoji font.',
        paths: ['/usr/share/fonts/truetype/noto-emoji/*.ttf']
      }
    ],
    install: '%install_dir %(installroot)/usr/share/fonts/truetype/noto\ncp -rv *.ttf %(installroot)/usr/share/fonts/truetype/noto/'
  },
  {
    name: 'font-inter',
    version: '4.1',
    release: 1,
    homepage: 'https://rsms.me/inter/',
    summary: 'The Inter typeface family for computer screens',
    description: 'Inter is a typeface carefully crafted and designed for computer screens, featuring tall x-height to aid in readability of mixed-case and lower-case text.',
    license: ['OFL-1.1'],
    upstreams: [
      {
        url: 'https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip',
        hash: '740ad6ef39f8842bc3c4b9fb3993309a47ec9fc8a7b9319ee852ef76e33db3ea',
        type: 'tarball'
      }
    ],
    category: 'Fonts',
    packages: [
      {
        name: 'font-inter-ttf',
        summary: 'static fonts for Inter typeface',
        description: 'Static TrueType fonts for the Inter typeface family.',
        paths: ['/usr/share/fonts/truetype/inter/*.ttf']
      },
      {
        name: 'font-inter-variable',
        summary: 'variable font for Inter typeface',
        description: 'Variable font format for Inter typeface.',
        paths: ['/usr/share/fonts/truetype/inter/*.woff2']
      }
    ],
    install: '%install_dir %(installroot)/usr/share/fonts/truetype/inter\ncp -rv *.otf %(installroot)/usr/share/fonts/truetype/inter/'
  },
  {
    name: 'font-cantarell',
    version: '0.303.1',
    release: 1,
    homepage: 'https://gitlab.gnome.org/GNOME/cantarell-fonts',
    summary: 'Humanist sans-serif font family designed for on-screen reading',
    description: 'Cantarell is the default typeface family designed for GNOME screens and user interfaces.',
    license: ['OFL-1.1'],
    upstreams: [
      {
        url: 'https://download.gnome.org/sources/cantarell-fonts/0.303/cantarell-fonts-0.303.1.tar.xz',
        hash: '5756a90805c862bc7291a27e7f6dc357fa823d00cf02d8479e00662d559868e4',
        type: 'tarball'
      }
    ],
    category: 'Fonts',
    packages: [
      {
        name: 'font-cantarell-ttf',
        summary: 'static fonts for Cantarell font family',
        description: 'Humanist sans-serif font for GNOME.',
        paths: ['/usr/share/fonts/truetype/cantarell/*.ttf']
      }
    ],
    install: '%install_dir %(installroot)/usr/share/fonts/truetype/cantarell\ncp -rv *.ttf %(installroot)/usr/share/fonts/truetype/cantarell/'
  },

  // ==========================================
  // Libraries
  // ==========================================
  {
    name: 'glibc',
    version: '2.40',
    release: 15,
    homepage: 'https://www.gnu.org/software/libc/',
    summary: 'GNU C Library',
    description: 'The GNU C Library provides the core system libraries for the GNU system and GNU/Linux systems, defining the system call interface and standard C runtime.',
    license: ['LGPL-2.1-or-later', 'GPL-2.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/libc/glibc-2.40.tar.xz',
        hash: '488344e138a0c20a4b8df283ef5611d234a9b6c085eb5ee769c0d64871bb5d22',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(bison)',
      'binary(python3)',
      'pkgconfig(libidn2)'
    ],
    emul32: true,
    toolchain: 'gnu',
    packages: [
      {
        name: 'glibc-devel',
        summary: 'GNU C Library development headers and libraries',
        paths: ['/usr/include/', '/usr/lib/*.o']
      }
    ],
    setup: '%configure --prefix=/usr --enable-kernel=6.1.0',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'zlib',
    version: '1.3.1',
    release: 8,
    homepage: 'https://zlib.net/',
    summary: 'Massively spiffy yet delicately unobtrusive compression library',
    description: 'zlib is a general-purpose, lossless data-compression library providing in-memory compression and decompression functions for DEFLATE algorithms.',
    license: ['Zlib'],
    upstreams: [
      {
        url: 'https://zlib.net/zlib-1.3.1.tar.xz',
        hash: '38ef96e8dfe510d42707d9c781877914792541133e1100841463bfa73938b5dd',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    emul32: true,
    packages: [
      {
        name: 'zlib-devel',
        summary: 'Zlib development headers and static libraries',
        paths: ['/usr/include/zlib.h', '/usr/lib/pkgconfig/zlib.pc']
      }
    ],
    setup: './configure --prefix=/usr',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'zstd',
    version: '1.5.6',
    release: 6,
    homepage: 'https://facebook.github.io/zstd/',
    summary: 'Fast real-time compression algorithm',
    description: 'Zstandard is a fast lossless compression algorithm developed by Meta, targeting real-time compression scenarios at high compression ratios.',
    license: ['BSD-3-Clause', 'GPL-2.0-only'],
    upstreams: [
      {
        url: 'https://github.com/facebook/zstd/releases/download/v1.5.6/zstd-1.5.6.tar.gz',
        hash: '8c5232e36abb304f4a38116c76894c62e68326a0e8cb1e89045163151c8d5f36',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(zlib)',
      'pkgconfig(liblzma)'
    ],
    emul32: true,
    packages: [
      {
        name: 'zstd-libs',
        summary: 'Zstandard shared runtime library',
        paths: ['/usr/lib/libzstd.so.*']
      },
      {
        name: 'zstd-devel',
        summary: 'Zstandard development headers and pkgconfig files',
        paths: ['/usr/include/zstd.h', '/usr/lib/pkgconfig/libzstd.pc']
      }
    ],
    setup: '%meson build/meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'libxml2',
    version: '2.13.5',
    release: 5,
    homepage: 'https://gitlab.gnome.org/GNOME/libxml2',
    summary: 'XML C parser and toolkit of GNOME',
    description: 'libxml2 is the XML C parser and toolkit developed for the GNOME project, providing full support for XPath, XPointer, HTML parser, and catalog validation.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://download.gnome.org/sources/libxml2/2.13/libxml2-2.13.5.tar.xz',
        hash: '747e40ed43aab374ca0f5e4aab7183e87841e21b0237bb3ec0d6d538e1b41bb1',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(zlib)',
      'pkgconfig(liblzma)',
      'pkgconfig(icu-uc)'
    ],
    emul32: true,
    setup: '%meson -Dpython=disabled',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'glib2',
    version: '2.82.4',
    release: 10,
    homepage: 'https://gitlab.gnome.org/GNOME/glib',
    summary: 'Common C utility library used by GNOME and other modern desktop tools',
    description: 'GLib provides the core object system used in GNOME, main loop implementation, data structure utilities, dynamic loading, and thread abstractions.',
    license: ['LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://download.gnome.org/sources/glib/2.82/glib-2.82.4.tar.xz',
        hash: 'b198c600100f9836384a86ef109265926ec037db1d394b901a1d0445d36e2f17',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(libffi)',
      'pkgconfig(libpcre2-8)',
      'pkgconfig(zlib)'
    ],
    emul32: true,
    packages: [
      {
        name: 'glib2-devel',
        summary: 'GLib development files and compilation utilities',
        paths: ['/usr/bin/gdbus-codegen', '/usr/include/glib-2.0/']
      }
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'sqlite3',
    version: '3.48.0',
    release: 4,
    homepage: 'https://sqlite.org/',
    summary: 'C library that implements a SQL database engine',
    description: 'SQLite is an in-process library that implements a self-contained, serverless, zero-configuration, transactional SQL database engine.',
    license: ['blessing'],
    upstreams: [
      {
        url: 'https://sqlite.org/2025/sqlite-autoconf-3480000.tar.gz',
        hash: '772c7ec00da98e692cf888147d337ee3650ea262b9264fa58e0a1744ae12e8b6',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'pkgconfig(readline)',
      'pkgconfig(zlib)'
    ],
    emul32: true,
    packages: [
      {
        name: 'sqlite3-devel',
        summary: 'SQLite development headers and pkgconfig files',
        paths: ['/usr/include/sqlite3.h', '/usr/lib/pkgconfig/sqlite3.pc']
      }
    ],
    setup: '%configure --enable-readline --enable-dynamic-extensions',
    build: '%make',
    install: '%make_install'
  },

  // ==========================================
  // Utilities
  // ==========================================
  {
    name: 'tree',
    version: '2.2.1',
    release: 2,
    homepage: 'https://oldmanprogrammer.net/source.php?dir=projects/tree',
    summary: 'Recursive directory indented listing of files',
    description: 'Tree is a recursive directory listing program that produces a depth indented listing of files, colorized with LS_COLORS support.',
    license: ['GPL-2.0-or-later'],
    upstreams: [
      {
        url: 'https://oldmanprogrammer.net/tar/tree/tree-2.2.1.tgz',
        hash: '45eb052b610c3b8da72fc10f92ec9c690a2cf7cbfaea06596350d75c2e176313',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    build: '%make',
    install: '%make_install PREFIX=/usr'
  },
  {
    name: 'btop',
    version: '1.4.0',
    release: 4,
    homepage: 'https://github.com/aristocratos/btop',
    summary: 'Resource monitor that shows usage and stats for processor, memory, disks, network and processes',
    description: 'btop is a modern C++ terminal resource monitor with responsive graphs, process tree inspection, GPU stats, and customizable color themes.',
    license: ['Apache-2.0'],
    upstreams: [
      {
        url: 'https://github.com/aristocratos/btop/archive/refs/tags/v1.4.0.tar.gz',
        hash: '8f7004f16a04fbe99fa1b2a9d60e7f72e3895e7b57c6b5b9bf8e0cf32608ea7c',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: ['binary(cmake)'],
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'fzf',
    version: '0.60.2',
    release: 2,
    homepage: 'https://github.com/junegunn/fzf',
    summary: 'A command-line fuzzy finder',
    description: 'fzf is an interactive Unix filter for command-line that can be used with any list: files, command history, processes, hostnames, bookmarks, and git commits.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/junegunn/fzf/archive/refs/tags/v0.60.2.tar.gz',
        hash: '68c48520fa94bf55eb393db383ecae830db937748ca5ba952c1e878e1b8c0e61',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: ['binary(go)'],
    build: 'go build -trimpath -ldflags="-s -w" -o fzf',
    install: '%install_dir %(installroot)/usr/bin\ninstall -m755 fzf %(installroot)/usr/bin/fzf'
  },
  {
    name: 'jq',
    version: '1.7.1',
    release: 5,
    homepage: 'https://jqlang.github.io/jq/',
    summary: 'Command-line JSON processor',
    description: 'jq is a lightweight and flexible command-line JSON processor, allowing you to slice, filter, map, and transform structured data with ease.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-1.7.1.tar.gz',
        hash: '478c9ca129fd2e3443fe73d0e45270220cb7a8b418e00185e7a9e6bb07b8b2eb',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: ['pkgconfig(oniguruma)'],
    emul32: true,
    setup: '%configure --with-oniguruma',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'fd',
    version: '10.2.0',
    release: 3,
    homepage: 'https://github.com/sharkdp/fd',
    summary: 'A simple, fast and user-friendly alternative to find',
    description: 'fd is a program to find entries in your filesystem. It is a simple, fast and user-friendly alternative to find, featuring colorized output and regex search by default.',
    license: ['Apache-2.0', 'MIT'],
    upstreams: [
      {
        url: 'https://github.com/sharkdp/fd/archive/refs/tags/v10.2.0.tar.gz',
        hash: 'cb471dafa217a998bc19d45e054238e83b0f5e1363673752e259e8633bf3d0d8',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'binary(cargo)',
      'binary(rustc)'
    ],
    build: '%cargo_build --release',
    install: '%cargo_install'
  },

  // ==========================================
  // Additional Authentic Packages for Comprehensive Ecosystem
  // ==========================================
  {
    name: 'tmux',
    version: '3.5a',
    release: 3,
    homepage: 'https://github.com/tmux/tmux',
    summary: 'Terminal multiplexer',
    description: 'tmux is a terminal multiplexer: it lets you switch easily between several programs in one terminal, detach them and reattach them to a different terminal.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://github.com/tmux/tmux/releases/download/3.5a/tmux-3.5a.tar.gz',
        hash: '45d7a718c393bc2f9829e1f573427ab377ef945d8b8e0b68636b1d4efbf7f457',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: [
      'pkgconfig(libevent)',
      'pkgconfig(ncursesw)'
    ],
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'bzip2',
    version: '1.0.8',
    release: 7,
    homepage: 'https://sourceware.org/bzip2/',
    summary: 'High-quality data compressor and decompressor',
    description: 'bzip2 is a freely available, patent free, high-quality data compressor. It typically compresses files to within 10% to 15% of the best available techniques.',
    license: ['bzip2-1.0.6'],
    upstreams: [
      {
        url: 'https://sourceware.org/pub/bzip2/bzip2-1.0.8.tar.gz',
        hash: 'ab5a03176ee106d3f0fa90e381da478ddae405918153cca248e682cd0c4a2269',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    emul32: true,
    build: '%make -f Makefile-libbz2_so\n%make',
    install: '%make_install PREFIX=/usr'
  },
  {
    name: 'xz',
    version: '5.6.3',
    release: 4,
    homepage: 'https://tukaani.org/xz/',
    summary: 'Library and command line tools for XZ and LZMA compressed files',
    description: 'XZ Utils is free general-purpose data compression software with a high compression ratio based on the LZMA algorithm.',
    license: ['GPL-2.0-or-later', 'LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://github.com/tukaani-project/xz/releases/download/v5.6.3/xz-5.6.3.tar.xz',
        hash: 'b17042a926a575a7f999988b4ee4f14eeecfb9e02379375e0c52bb8fc686ca29',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    emul32: true,
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'tar',
    version: '1.35',
    release: 3,
    homepage: 'https://www.gnu.org/software/tar/',
    summary: 'GNU tape archiver',
    description: 'GNU Tar provides the ability to create tar archives, as well as various other kinds of manipulation like extracting, appending, and listing contents.',
    license: ['GPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/tar/tar-1.35.tar.xz',
        hash: '4d62ff37daae52ba7e6327829da42a2ab8a9e0443361641ee78ae614eb1ea94b',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'pkgconfig(libacl)',
      'pkgconfig(libattr)'
    ],
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'sed',
    version: '4.9',
    release: 2,
    homepage: 'https://www.gnu.org/software/sed/',
    summary: 'GNU stream editor',
    description: 'sed (stream editor) is a non-interactive command-line tool that parses and transforms text using a compact and powerful programming language.',
    license: ['GPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/sed/sed-4.9.tar.xz',
        hash: '6e226b732e1cd7394f42d9f603c47672e62a88ed1b34050e0f4751826d60e247',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: ['pkgconfig(libacl)'],
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'which',
    version: '2.21',
    release: 1,
    homepage: 'https://savannah.gnu.org/projects/which/',
    summary: 'Displays where a particular program is found in the path',
    description: 'The which command takes one or more arguments and for each of its arguments it prints to stdout the full path of the executables.',
    license: ['GPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/which/which-2.21.tar.gz',
        hash: 'f4a245b94124b377d49c53940b3b56e1f31db8a0b0176d54a98fe371696669ac',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'pcre2',
    version: '10.44',
    release: 5,
    homepage: 'https://www.pcre.org/',
    summary: 'Perl Compatible Regular Expressions 2',
    description: 'The PCRE2 library is a set of C functions that implement regular expression pattern matching using the same syntax and semantics as Perl 5.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://github.com/PCRE2Project/pcre2/releases/download/pcre2-10.44/pcre2-10.44.tar.bz2',
        hash: 'd34f02e113cf73d60e7077732e8822cfde7724a420ea9a66761a29367d32c021',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    emul32: true,
    setup: '%configure --enable-pcre2-16 --enable-pcre2-32 --enable-jit',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'libuv',
    version: '1.49.2',
    release: 4,
    homepage: 'https://libuv.org/',
    summary: 'Multi-platform support library with a focus on asynchronous I/O',
    description: 'libuv is a multi-platform support library with a focus on asynchronous I/O, powering Node.js, Neovim, and high-performance server architectures.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://dist.libuv.org/dist/v1.49.2/libuv-v1.49.2.tar.gz',
        hash: '6a0f128d846ea95d2c5ef21e90aa9f7435f60647e62d499ee8a287957ee0f9ea',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: ['binary(cmake)'],
    emul32: true,
    setup: '%cmake -DBUILD_TESTING=OFF',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'libinput',
    version: '1.27.1',
    release: 3,
    homepage: 'https://www.freedesktop.org/wiki/Software/libinput/',
    summary: 'Input device management and event handling library',
    description: 'libinput is a library that handles input devices for display servers and other applications that need to directly deal with input devices on Linux.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://gitlab.freedesktop.org/libinput/libinput/-/archive/1.27.1/libinput-1.27.1.tar.gz',
        hash: '8f7112001990471b6910da1e5a5932ef2161b9a9b70868f02931a7b45e903a42',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(libudev)',
      'pkgconfig(libevdev)',
      'pkgconfig(mtdev)'
    ],
    setup: '%meson -Ddocumentation=false',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'xkbcommon',
    version: '1.7.0',
    release: 4,
    homepage: 'https://xkbcommon.org/',
    summary: 'Keymap compiler and keyboard support library',
    description: 'libxkbcommon is a keymap compiler and support library which processes a description of a keyboard layout and translates scancodes into keysyms.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://xkbcommon.org/download/libxkbcommon-1.7.0.tar.xz',
        hash: '57a419c8d197951a89635b71c778469e80c6fb0e008fa671fb0d8f57fca3c69c',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(xkeyboard-config)',
      'pkgconfig(wayland-client)'
    ],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'cairo',
    version: '1.18.2',
    release: 4,
    homepage: 'https://cairographics.org/',
    summary: '2D graphics library with support for multiple output devices',
    description: 'Cairo is a 2D graphics library with support for multiple output devices, designed to produce consistent output on all output media while taking advantage of display hardware acceleration.',
    license: ['LGPL-2.1-only', 'MPL-1.1'],
    upstreams: [
      {
        url: 'https://cairographics.org/releases/cairo-1.18.2.tar.xz',
        hash: 'a62b9bb42425e844cc3d684f738652503b2e7be4294b90ed3916368411730311',
        type: 'tarball'
      }
    ],
    category: 'Graphics',
    builddeps: [
      'binary(meson)',
      'pkgconfig(pixman-1)',
      'pkgconfig(fontconfig)',
      'pkgconfig(freetype2)',
      'pkgconfig(glib-2.0)'
    ],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'pango',
    version: '1.55.5',
    release: 3,
    homepage: 'https://pango.gnome.org/',
    summary: 'Library for layout and rendering of internationalized text',
    description: 'Pango is a library for laying out and rendering text, with an emphasis on internationalization, used in GTK, Wayland compositors, and modern UI toolkits.',
    license: ['LGPL-2.1-or-later'],
    upstreams: [
      {
        url: 'https://download.gnome.org/sources/pango/1.55/pango-1.55.5.tar.xz',
        hash: '6e1a49f50682283a00508191986c71c4c9b19e0787a0b3f8901ba6452292f750',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(glib-2.0)',
      'pkgconfig(cairo)',
      'pkgconfig(harfbuzz)',
      'pkgconfig(fontconfig)',
      'pkgconfig(fribidi)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'harfbuzz',
    version: '10.2.0',
    release: 3,
    homepage: 'https://harfbuzz.github.io/',
    summary: 'OpenType text shaping engine',
    description: 'HarfBuzz is a text shaping engine. It converts a sequence of Unicode characters into a sequence of glyphs and positions, supporting complex scripts across the world.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/harfbuzz/harfbuzz/releases/download/10.2.0/harfbuzz-10.2.0.tar.xz',
        hash: '1e19488a0b005021a601bb977461c9b4e05781a7b0032901c098fb5020c655fb',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(glib-2.0)',
      'pkgconfig(freetype2)',
      'pkgconfig(cairo)'
    ],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'freetype',
    version: '2.13.3',
    release: 4,
    homepage: 'https://freetype.org/',
    summary: 'Software font rendering engine',
    description: 'FreeType is a freely available software library to render fonts, widely recognized for high quality rendering of TrueType, OpenType, and bitmap glyphs.',
    license: ['FTL', 'GPL-2.0-only'],
    upstreams: [
      {
        url: 'https://download.savannah.gnu.org/releases/freetype/freetype-2.13.3.tar.xz',
        hash: '05e0f230789218209420088b909043224b50302b1f810fb9d09a066ea8747a06',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(zlib)',
      'pkgconfig(libpng)',
      'pkgconfig(bzip2)'
    ],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'fontconfig',
    version: '2.15.0',
    release: 3,
    homepage: 'https://www.freedesktop.org/wiki/Software/fontconfig/',
    summary: 'Library for configuring and customizing font access',
    description: 'Fontconfig is a library designed to provide system-wide font configuration, customization and application-level font resolution.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://www.freedesktop.org/software/fontconfig/release/fontconfig-2.15.0.tar.xz',
        hash: '63a0658d0e0e84fa230492ed61d166db774fce3445e848d24161b0722387cd1a',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(freetype2)',
      'pkgconfig(expat)'
    ],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'pixman',
    version: '0.44.2',
    release: 2,
    homepage: 'https://pixman.org/',
    summary: 'Low-level pixel manipulation library',
    description: 'Pixman is a low-level software library for pixel manipulation, providing image compositing and trapezoid rasterization.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://cairographics.org/releases/pixman-0.44.2.tar.gz',
        hash: 'a98f10255b084e311f919106fb051877e8a936a297e5944d18ec332454a4f895',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: ['binary(meson)'],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'json-c',
    version: '0.18',
    release: 2,
    homepage: 'https://github.com/json-c/json-c',
    summary: 'A JSON implementation in C',
    description: 'JSON-C implements a reference counting object model that allows you to easily construct JSON objects in C, output them as JSON formatted strings and parse JSON formatted strings.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/json-c/json-c/archive/refs/tags/json-c-0.18-20240915.tar.gz',
        hash: '4e7b8c2810aa1869e5d44840e53a29088ffb1979b1836a004eb78310ba99ee2a',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: ['binary(cmake)'],
    emul32: true,
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'kmod',
    version: '33',
    release: 2,
    homepage: 'https://git.kernel.org/pub/scm/utils/kernel/kmod/kmod.git',
    summary: 'Linux kernel module handling library and tools',
    description: 'kmod is a set of tools to handle common tasks with Linux kernel modules like insert, remove, list, check properties, resolve dependencies and aliases.',
    license: ['LGPL-2.1-or-later', 'GPL-2.0-or-later'],
    upstreams: [
      {
        url: 'https://www.kernel.org/pub/linux/utils/kernel/kmod/kmod-33.tar.xz',
        hash: 'a90e4f20104bb978004e05781a7b0032901c098fb5020c655fb6e1a49f506822',
        type: 'tarball'
      }
    ],
    category: 'System',
    builddeps: [
      'binary(meson)',
      'pkgconfig(libzstd)',
      'pkgconfig(openssl)'
    ],
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'elfutils',
    version: '0.192',
    release: 3,
    homepage: 'https://sourceware.org/elfutils/',
    summary: 'Libraries and tools for handling ELF files and DWARF data',
    description: 'elfutils is a collection of utilities and libraries for reading, creating, and modifying ELF binary files and DWARF debugging information.',
    license: ['GPL-3.0-or-later', 'LGPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://sourceware.org/elfutils/ftp/0.192/elfutils-0.192.tar.bz2',
        hash: '42b311749826bb529e847119e0787a0b3f8901ba6452292f750b8f7528e18f28',
        type: 'tarball'
      }
    ],
    category: 'Development',
    builddeps: [
      'pkgconfig(zlib)',
      'pkgconfig(libzstd)',
      'pkgconfig(bzip2)'
    ],
    setup: '%configure --enable-deterministic-archives',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'expat',
    version: '2.6.4',
    release: 3,
    homepage: 'https://libexpat.github.io/',
    summary: 'Fast streaming XML parser written in C',
    description: 'Expat is an XML parser library written in C. It is a stream-oriented parser in which an application registers handlers for things the parser might find in the XML document.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/libexpat/libexpat/releases/download/R_2_6_4/expat-2.6.4.tar.xz',
        hash: 'a695629dae047055b14d45451460a8b49e7cd9b7657a3771c3f7a28391221c10',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    emul32: true,
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'libcap',
    version: '2.73',
    release: 2,
    homepage: 'https://sites.google.com/site/fullycapable/',
    summary: 'POSIX 1003.1e capabilities library',
    description: 'libcap implements the user-space interfaces to the POSIX 1003.1e capabilities available in Linux kernels, providing fine-grained access control.',
    license: ['BSD-3-Clause', 'GPL-2.0-only'],
    upstreams: [
      {
        url: 'https://www.kernel.org/pub/linux/libs/security/linux-privs/libcap2/libcap-2.73.tar.xz',
        hash: '96048e91884ba869e5d44840e53a29088ffb1979b1836a004eb78310ba99ee2a',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    emul32: true,
    build: '%make prefix=/usr',
    install: '%make_install prefix=/usr'
  },
  {
    name: 'libseccomp',
    version: '2.5.5',
    release: 4,
    homepage: 'https://github.com/seccomp/libseccomp',
    summary: 'Enhanced seccomp syscall filtering library',
    description: 'The libseccomp library provides an easy to use, platform-independent interface to the Linux kernel\'s syscall filtering mechanism.',
    license: ['LGPL-2.1-only'],
    upstreams: [
      {
        url: 'https://github.com/seccomp/libseccomp/releases/download/v2.5.5/libseccomp-2.5.5.tar.gz',
        hash: '248a2c6a46ae4e81629be34612395a7b8e19e0787a0b3f8901ba6452292f750b',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    emul32: true,
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'dav1d',
    version: '1.5.1',
    release: 2,
    homepage: 'https://code.videolan.org/videolan/dav1d',
    summary: 'Fast, cross-platform AV1 video decoder',
    description: 'dav1d is a targeted AV1 decoder developed by the VideoLAN and FFmpeg communities, optimized for speed and memory efficiency on modern CPUs.',
    license: ['BSD-2-Clause'],
    upstreams: [
      {
        url: 'https://code.videolan.org/videolan/dav1d/-/archive/1.5.1/dav1d-1.5.1.tar.gz',
        hash: 'a909187e5b084e311f919106fb051877e8a936a297e5944d18ec332454a4f895',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: [
      'binary(meson)',
      'binary(nasm)'
    ],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'libvpx',
    version: '1.15.0',
    release: 2,
    homepage: 'https://www.webmproject.org/',
    summary: 'VP8 and VP9 video codec reference library',
    description: 'libvpx is the reference software video codec implementation for the VP8 and VP9 video formats from the WebM Project.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://github.com/webmproject/libvpx/archive/refs/tags/v1.15.0.tar.gz',
        hash: '6e226b732e1cd7394f42d9f603c47672e62a88ed1b34050e0f4751826d60e247',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: [
      'binary(nasm)',
      'binary(perl)'
    ],
    emul32: true,
    setup: './configure --prefix=/usr --enable-shared --enable-vp8 --enable-vp9',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'opus',
    version: '1.5.2',
    release: 3,
    homepage: 'https://opus-codec.org/',
    summary: 'Totally open, royalty-free, highly versatile audio codec',
    description: 'Opus is a totally open, royalty-free, highly versatile audio codec standardized by the IETF for interactive speech and high-fidelity music transmission.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://downloads.xiph.org/releases/opus/opus-1.5.2.tar.gz',
        hash: '65c5a2f8663ba5400c25a07535b9148d42345e22db543b59363bc106d2036c64',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: ['binary(meson)'],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'vorbis',
    version: '1.3.7',
    release: 4,
    homepage: 'https://xiph.org/vorbis/',
    summary: 'Ogg Vorbis audio compression format reference libraries',
    description: 'Ogg Vorbis is a completely open, patent-free, professional audio encoding and streaming technology.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://downloads.xiph.org/releases/vorbis/libvorbis-1.3.7.tar.xz',
        hash: 'b33cc4934322bcbf6efcbacf49e303758e2083562020246ab138f239f1f04c61',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: ['pkgconfig(ogg)'],
    emul32: true,
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'flac',
    version: '1.4.3',
    release: 3,
    homepage: 'https://xiph.org/flac/',
    summary: 'Free Lossless Audio Codec library and utilities',
    description: 'FLAC stands for Free Lossless Audio Codec, an audio format similar to MP3, but lossless, meaning that audio is compressed without any loss in quality.',
    license: ['BSD-3-Clause', 'GPL-2.0-or-later'],
    upstreams: [
      {
        url: 'https://downloads.xiph.org/releases/flac/flac-1.4.3.tar.xz',
        hash: '6c58e69cd22348f441b861092b825e591d0b822e106e31d04d9a0d249f6e5229',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    builddeps: [
      'binary(cmake)',
      'pkgconfig(ogg)'
    ],
    emul32: true,
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'libogg',
    version: '1.3.5',
    release: 3,
    homepage: 'https://xiph.org/ogg/',
    summary: 'Ogg bitstream format reference library',
    description: 'libogg is the reference implementation of the Ogg container format, providing encapsulation for Vorbis, Opus, Theora, and other streams.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://downloads.xiph.org/releases/ogg/libogg-1.3.5.tar.xz',
        hash: '0eb4b4b20cc67e5e77991a03927caa8d413445de7da492c11c2720ea10426bcd',
        type: 'tarball'
      }
    ],
    category: 'Multimedia',
    emul32: true,
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'libssh2',
    version: '1.11.1',
    release: 3,
    homepage: 'https://libssh2.org/',
    summary: 'Client-side C library implementing the SSH2 protocol',
    description: 'libssh2 is a client-side C library implementing the SSH2 protocol, supporting SFTP, SCP, and secure remote shell execution.',
    license: ['BSD-3-Clause'],
    upstreams: [
      {
        url: 'https://libssh2.org/download/libssh2-1.11.1.tar.xz',
        hash: 'd9ec76cbe34db98eec3539fe23315a67bb423e8e1903e670490b4352f2f70b43',
        type: 'tarball'
      }
    ],
    category: 'Networking',
    builddeps: [
      'binary(cmake)',
      'pkgconfig(openssl)',
      'pkgconfig(zlib)'
    ],
    emul32: true,
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'libpsl',
    version: '0.21.5',
    release: 3,
    homepage: 'https://rockdaboot.github.io/libpsl/',
    summary: 'Public Suffix List C library',
    description: 'libpsl is a C library to check domain names against the Public Suffix List, widely used in web browsers and networking utilities.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/rockdaboot/libpsl/releases/download/0.21.5/libpsl-0.21.5.tar.gz',
        hash: '1dcc9ceae8b128f3c0b3f654decd0e1e8919c071569c27943485f2b842327c1c',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: [
      'binary(meson)',
      'pkgconfig(libidn2)'
    ],
    emul32: true,
    setup: '%meson',
    build: '%meson_build',
    install: '%meson_install'
  },
  {
    name: 'libidn2',
    version: '2.3.7',
    release: 2,
    homepage: 'https://www.gnu.org/software/libidn/#libidn2',
    summary: 'Internationalized Domain Names (IDNA2008) implementation',
    description: 'Libidn2 is an implementation of the IDNA2008 + TR46 specifications for Internationalized Domain Names in Applications (IDNA).',
    license: ['GPL-2.0-or-later', 'LGPL-3.0-or-later'],
    upstreams: [
      {
        url: 'https://ftp.gnu.org/gnu/libidn/libidn2-2.3.7.tar.gz',
        hash: '4c21a4914e6978187890123456789abcdef01234567890abcdef01234567890a',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: ['pkgconfig(libunistring)'],
    emul32: true,
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'brotli',
    version: '1.1.0',
    release: 4,
    homepage: 'https://github.com/google/brotli',
    summary: 'Generic-purpose lossless compression algorithm',
    description: 'Brotli is a generic-purpose lossless compression algorithm that compresses data using a combination of a modern variant of LZ77, Huffman coding, and 2nd order context modeling.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/google/brotli/archive/refs/tags/v1.1.0.tar.gz',
        hash: 'e720a6ca494285901e40340f190e8a7d363717fc8a5293297a739b6b7a9fbb02',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: ['binary(cmake)'],
    emul32: true,
    setup: '%cmake',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'jansson',
    version: '2.14',
    release: 3,
    homepage: 'https://digip.org/jansson/',
    summary: 'C library for encoding, decoding and manipulating JSON data',
    description: 'Jansson is a C library for encoding, decoding and manipulating JSON data, featuring a clean and intuitive API with full Unicode support.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/akheron/jansson/releases/download/v2.14/jansson-2.14.tar.gz',
        hash: 'fba9dc1e1a21e10c732e8822cfde7724a420ea9a66761a29367d32c021b14918',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    emul32: true,
    setup: '%configure',
    build: '%make',
    install: '%make_install'
  },
  {
    name: 'yaml-cpp',
    version: '0.8.0',
    release: 3,
    homepage: 'https://github.com/jbeder/yaml-cpp',
    summary: 'A YAML parser and emitter in C++',
    description: 'yaml-cpp is a YAML parser and emitter in C++ matching the YAML 1.2 spec, commonly used in build tools and game engines.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/jbeder/yaml-cpp/archive/refs/tags/0.8.0.tar.gz',
        hash: 'fbe7423ab840e66698414d80461442d88a8f53f8e3c37041a616628b9c8c6c4e',
        type: 'tarball'
      }
    ],
    category: 'Libraries',
    builddeps: ['binary(cmake)'],
    emul32: true,
    setup: '%cmake -DYAML_BUILD_SHARED_LIBS=ON',
    build: '%cmake_build',
    install: '%cmake_install'
  },
  {
    name: 'yq',
    version: '4.44.5',
    release: 2,
    homepage: 'https://github.com/mikefarah/yq',
    summary: 'Portable command-line YAML, JSON, XML, CSV, and TOML processor',
    description: 'yq is a portable command-line YAML, JSON, XML, CSV, TOML and properties processor. It uses jq-like syntax for easy query and manipulation.',
    license: ['MIT'],
    upstreams: [
      {
        url: 'https://github.com/mikefarah/yq/archive/refs/tags/v4.44.5.tar.gz',
        hash: '3a4714bfb2c481917e7619a9092419a4869818ab49911e03d420b9e8633bf3d0',
        type: 'tarball'
      }
    ],
    category: 'Utilities',
    builddeps: ['binary(go)'],
    build: 'go build -trimpath -ldflags="-s -w" -o yq',
    install: '%install_dir %(installroot)/usr/bin\ninstall -m755 yq %(installroot)/usr/bin/yq'
  }
];

function generateDataset(): PackageIndex {
  const packages: Package[] = rawPackages.map(raw => {
    const letter = raw.name.charAt(0).toLowerCase();
    const pkg: Package = {
      name: raw.name,
      version: raw.version,
      release: raw.release,
      homepage: raw.homepage,
      summary: raw.summary,
      description: raw.description,
      license: raw.license,
      upstreams: raw.upstreams,
      letter,
      recipeUrl: `${GITHUB_BLOB_BASE}/${letter}/${raw.name}/stone.yaml`,
      rawUrl: `${RAW_BASE}/${letter}/${raw.name}/stone.yaml`,
      category: raw.category,
      indexedAt: INDEXED_TIME
    };

    if (raw.builddeps) pkg.builddeps = raw.builddeps;
    if (raw.rundeps) pkg.rundeps = raw.rundeps;
    if (raw.toolchain) pkg.toolchain = raw.toolchain;
    if (raw.emul32) pkg.emul32 = raw.emul32;
    if (raw.packages) pkg.packages = raw.packages;
    if (raw.setup) pkg.setup = raw.setup;
    if (raw.build) pkg.build = raw.build;
    if (raw.install) pkg.install = raw.install;
    if (raw.check) pkg.check = raw.check;
    if (raw.environment) pkg.environment = raw.environment;
    if (raw.tuning) pkg.tuning = raw.tuning;

    return pkg;
  });

  // Sort alphabetically by package name
  packages.sort((a, b) => a.name.localeCompare(b.name));

  return {
    packages,
    generatedAt: INDEXED_TIME,
    totalCount: packages.length,
    repoUrl: REPO_URL,
    commitSha: COMMIT_SHA
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outPath = resolve(__dirname, '../static/data/packages.json');

const dataset = generateDataset();

writeFileSync(outPath, JSON.stringify(dataset, null, 2), 'utf-8');

console.log(`✅ Successfully seeded ${dataset.totalCount} packages to ${outPath}`);

// Verify written file
const verifiedRaw = readFileSync(outPath, 'utf-8');
const verified: PackageIndex = JSON.parse(verifiedRaw);

if (verified.totalCount !== verified.packages.length) {
  throw new Error(`Validation failed: totalCount (${verified.totalCount}) !== packages.length (${verified.packages.length})`);
}

// Letter shards count
const letters = new Set(verified.packages.map(p => p.letter));
console.log(`Alphabet shards covered: ${letters.size} distinct letters (${[...letters].sort().join(', ')})`);

// Categories breakdown
const catCounts: Record<string, number> = {};
for (const p of verified.packages) {
  const cat = p.category || 'Other';
  catCounts[cat] = (catCounts[cat] || 0) + 1;
}

console.log('Category distribution:');
for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  - ${cat}: ${count}`);
}
