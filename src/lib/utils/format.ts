/**
 * Format utilities for the AerynOS Package Explorer.
 * These are pure functions with no side effects.
 */

/** Format a date string to a human-readable relative or absolute format */
export function formatDate(isoString: string): string {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Unknown';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/** Format an ISO date to a readable absolute date */
export function formatAbsoluteDate(isoString: string): string {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Extract domain name from URL for display */
export function formatDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Infer package category from name, summary, description, builddeps */
export function inferCategory(pkg: {
  name: string;
  summary: string;
  description?: string;
  builddeps?: string[];
  homepage?: string;
}): string {
  const name = pkg.name.toLowerCase();
  const summary = (pkg.summary || '').toLowerCase();
  const desc = (pkg.description || '').toLowerCase();
  const deps = (pkg.builddeps || []).join(' ').toLowerCase();
  const combined = `${name} ${summary} ${desc} ${deps}`;

  // Font packages
  if (name.includes('font') || name.includes('noto') || name.includes('roboto') || 
      summary.includes('font') || name.includes('ttf') || name.includes('otf')) return 'Fonts';

  // Libraries
  if (name.startsWith('lib') || name.endsWith('-libs') || summary.includes('library') ||
      summary.includes('libraries') || desc.includes('c library')) return 'Libraries';

  // Programming languages and runtimes
  if (['python', 'ruby', 'perl', 'golang', 'rust', 'nodejs', 'java', 'ghc', 'ocaml',
       'lua', 'erlang', 'elixir', 'kotlin', 'scala'].some(l => name.includes(l))) return 'Languages';

  // Desktop environments
  if (combined.includes('gnome') || combined.includes('kde') || combined.includes('plasma') ||
      combined.includes('cosmic') || combined.includes('xfce') || combined.includes('mate') ||
      combined.includes('desktop environment')) return 'Desktop';

  // Graphics/multimedia
  if (combined.includes('vulkan') || combined.includes('opengl') || name.includes('mesa') ||
      combined.includes('gpu') || combined.includes('graphics')) return 'Graphics';

  if (combined.includes('audio') || combined.includes('video') || combined.includes('codec') ||
      combined.includes('media') || combined.includes('ffmpeg') || combined.includes('gstreamer') ||
      combined.includes('music') || combined.includes('mpv')) return 'Multimedia';

  // Network
  if (combined.includes('network') || combined.includes('http') || combined.includes('dns') ||
      combined.includes('wifi') || combined.includes('vpn') || combined.includes('firewall') ||
      name.includes('curl') || name.includes('wget') || combined.includes('socket')) return 'Networking';

  // Security
  if (combined.includes('security') || combined.includes('crypto') || combined.includes('tls') ||
      combined.includes('ssl') || combined.includes('certificate') || name.includes('gpg') ||
      name.includes('openssl') || combined.includes('encryption')) return 'Security';

  // System/kernel
  if (name.includes('linux') || name.includes('kernel') || combined.includes('kernel') ||
      name.includes('systemd') || combined.includes('system call') || combined.includes('kernel module') ||
      name.includes('udev') || name.includes('dbus')) return 'System';

  // Development tools
  if (combined.includes('compiler') || combined.includes('debugger') || combined.includes('build system') ||
      name.includes('cmake') || name.includes('meson') || name.includes('ninja') ||
      name.includes('gcc') || name.includes('clang') || name.includes('llvm') ||
      combined.includes('development') || combined.includes('programming')) return 'Development';

  // Games
  if (combined.includes('game') || combined.includes('gaming') || combined.includes('emulator') ||
      name.includes('steam') || combined.includes('play')) return 'Games';

  // Utilities (catch-all for tools)
  if (combined.includes('utility') || combined.includes('tool') || combined.includes('command-line') ||
      combined.includes('command line') || combined.includes('cli')) return 'Utilities';

  return 'Other';
}

/** Generate the moss installation command */
export function installCommand(packageName: string): string {
  return `sudo moss package add ${packageName}`;
}

/** Normalize license field — always returns an array */
export function normalizeLicense(license: string | string[] | undefined): string[] {
  if (!license) return [];
  if (Array.isArray(license)) return license;
  return [license];
}

/** Parse upstream entries from stone.yaml format */
export function parseUpstreams(upstreams: Array<Record<string, string>> | undefined) {
  if (!upstreams || !Array.isArray(upstreams)) return [];
  return upstreams.map(entry => {
    const [url, hash] = Object.entries(entry)[0] || ['', ''];
    const isGit = url.startsWith('git|');
    return {
      url: isGit ? url.replace(/^git\|/, '') : url,
      hash: hash || '',
      type: (isGit ? 'git' : 'tarball') as 'tarball' | 'git',
    };
  });
}

/** Truncate text to N chars with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}
