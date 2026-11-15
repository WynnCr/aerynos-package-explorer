import type { Package, PackageIndex, ChannelStats, SearchFilters, SortOrder } from '$lib/data/types';

export type { SearchFilters, SortOrder, ChannelStats };

/** Global package data store using Svelte 5 runes */

let _packages = $state<Package[]>([]);
let _loading = $state(true);
let _error = $state<string | null>(null);
let _generatedAt = $state<string>('');
let _totalCount = $state(0);
let _commitSha = $state<string | undefined>(undefined);
let _channelStats = $state<ChannelStats | undefined>(undefined);

export const packageStore = {
  get packages() { return _packages; },
  get loading() { return _loading; },
  get error() { return _error; },
  get generatedAt() { return _generatedAt; },
  get totalCount() { return _totalCount; },
  get commitSha() { return _commitSha; },
  get channelStats() { return _channelStats; },

  async load() {
    _loading = true;
    _error = null;
    try {
      const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
      const url = `${base}/data/packages.json`.replace(/\/+/g, '/');
      const res = await fetch(url);
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
