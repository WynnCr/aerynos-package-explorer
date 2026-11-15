import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Package, SearchFilters, SortOrder } from '$lib/data/types';

export type ExtendedSortOrder = SortOrder | 'relevance';

const fuseOptions: IFuseOptions<Package> = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'summary', weight: 0.3 },
    { name: 'description', weight: 0.15 },
    { name: 'category', weight: 0.1 },
    { name: 'builddeps', weight: 0.05 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
};

let cachedFuse: { instance: Fuse<Package>; packages: Package[] } | null = null;

function getFuseInstance(packages: Package[]): Fuse<Package> {
  if (cachedFuse && cachedFuse.packages === packages) {
    return cachedFuse.instance;
  }
  const instance = new Fuse(packages, fuseOptions);
  cachedFuse = { instance, packages };
  return instance;
}

/**
 * Filter packages by category, license, letter shard, and toolchain
 */
export function filterPackages(packages: Package[], filters: SearchFilters): Package[] {
  return packages.filter(pkg => {
    if (filters.category && filters.category !== 'All') {
      const cat = (pkg.category || 'Other').toLowerCase();
      if (cat !== filters.category.toLowerCase()) return false;
    }

    if (filters.license && filters.license !== 'All') {
      const licenses = (pkg.license || []).map(l => l.toLowerCase());
      if (!licenses.includes(filters.license.toLowerCase())) return false;
    }

    if (filters.letter && filters.letter !== 'All') {
      const letter = (pkg.letter || pkg.name[0] || '').toLowerCase();
      if (letter !== filters.letter.toLowerCase()) return false;
    }

    if (filters.toolchain && filters.toolchain !== 'All') {
      const tc = (pkg.toolchain || 'llvm').toLowerCase();
      if (tc !== filters.toolchain.toLowerCase()) return false;
    }

    return true;
  });
}

/**
 * Sort packages according to requested order
 */
export function sortPackages(packages: Package[], sort: ExtendedSortOrder): Package[] {
  const result = [...packages];
  switch (sort) {
    case 'name-asc':
      return result.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return result.sort((a, b) => b.name.localeCompare(a.name));
    case 'recently-updated':
      return result.sort((a, b) => {
        // Compare release number first, then lastModified date if available
        if (a.lastModified && b.lastModified) {
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        }
        return b.release - a.release;
      });
    case 'recently-added':
      return result.sort((a, b) => {
        const timeA = a.indexedAt ? new Date(a.indexedAt).getTime() : 0;
        const timeB = b.indexedAt ? new Date(b.indexedAt).getTime() : 0;
        return timeB - timeA;
      });
    case 'relevance':
    default:
      return result;
  }
}

/**
 * Perform full search, filtering, and sorting pipeline
 */
export function searchPackages(
  allPackages: Package[],
  query: string,
  filters: SearchFilters = {},
  sort: ExtendedSortOrder = 'relevance'
): Package[] {
  let list = allPackages;

  const trimmed = query.trim();
  if (trimmed) {
    const fuse = getFuseInstance(allPackages);
    const results = fuse.search(trimmed);
    list = results.map(r => r.item);

    // Apply filters
    list = filterPackages(list, filters);

    // Only apply non-relevance sorting if explicitly requested
    if (sort !== 'relevance') {
      list = sortPackages(list, sort);
    }
  } else {
    // No query: filter first, then sort
    list = filterPackages(list, filters);
    // If sort is 'relevance', default to name-asc
    const effectiveSort = sort === 'relevance' ? 'name-asc' : sort;
    list = sortPackages(list, effectiveSort);
  }

  return list;
}

/**
 * Escape HTML to prevent XSS during search highlighting
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Highlight search match occurrences with orange pill tags
 */
export function highlightMatches(text: string, query: string): string {
  if (!text) return '';
  if (!query || !query.trim()) return escapeHtml(text);

  const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${cleanQuery})`, 'gi');

  const parts = text.split(regex);
  return parts
    .map(part => {
      if (part.toLowerCase() === query.trim().toLowerCase()) {
        return `<mark class="bg-orange-500/20 text-orange-300 rounded px-0.5">${escapeHtml(part)}</mark>`;
      }
      return escapeHtml(part);
    })
    .join('');
}
