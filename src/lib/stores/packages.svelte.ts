import type { Package, PackageIndex, PackageDetails, DetailsShard, ChannelStats, SearchFilters, SortOrder } from '$lib/data/types';

export type { SearchFilters, SortOrder, ChannelStats };

/** Global package data store using Svelte 5 runes */

let _packages = $state<Package[]>([]);
let _loading = $state(true);
let _error = $state<string | null>(null);
let _generatedAt = $state<string>('');
let _totalCount = $state(0);
let _commitSha = $state<string | undefined>(undefined);
let _channelStats = $state<ChannelStats | undefined>(undefined);

const dataUrl = (file: string) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  return `${base}/data/${file}`.replace(/\/+/g, '/');
};

// One shard per first letter, fetched on demand and kept for the session
const shards = new Map<string, Promise<DetailsShard>>();

export const packageStore = {
  get packages() { return _packages; },
  get loading() { return _loading; },
  get error() { return _error; },
  get generatedAt() { return _generatedAt; },
  get totalCount() { return _totalCount; },
  get commitSha() { return _commitSha; },
  get channelStats() { return _channelStats; },

  /** Build scripts, upstreams and sub-package paths for one package (loads its letter's shard). */
  async loadDetails(pkg: Package): Promise<PackageDetails | undefined> {
    let shard = shards.get(pkg.letter);
    if (!shard) {
      shard = fetch(dataUrl(`details/${pkg.letter}.json`)).then(res => {
        if (!res.ok) throw new Error(`Failed to load recipe details: ${res.status}`);
        return res.json() as Promise<DetailsShard>;
      });
      shards.set(pkg.letter, shard);
      shard.catch(() => shards.delete(pkg.letter)); // allow a retry after a failure
    }
    return (await shard)[pkg.name];
  },

  async load() {
    _loading = true;
    _error = null;
    try {
      const res = await fetch(dataUrl('packages.json'));
      if (!res.ok) throw new Error(`Failed to load package index: ${res.status}`);
      const data: PackageIndex = await res.json();
      _packages = data.packages || [];
      _generatedAt = data.generatedAt || '';
      _totalCount = data.totalCount || _packages.length;
      _commitSha = data.commitSha;
      _channelStats = data.channelStats;
    } catch (e) {
      _error = e instanceof Error ? e.message : 'Unknown error loading packages';
      _packages = [];
    } finally {
      _loading = false;
    }
  }
};
