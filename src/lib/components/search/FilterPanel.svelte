<script lang="ts">
  import type { SearchFilters } from '$lib/data/types';
  import type { ExtendedSortOrder } from '$lib/utils/search';
  import { Filter, ArrowUpDown, X, RotateCcw } from 'lucide-svelte';

  const ALPHABET = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const CATEGORIES = [
    'All',
    'Development',
    'System',
    'Desktop',
    'Networking',
    'Security',
    'Multimedia',
    'Graphics',
    'Languages',
    'Libraries',
    'Fonts',
    'Games',
    'Utilities',
    'Other'
  ];

  const POPULAR_LICENSES = [
    'All',
    'MIT',
    'GPL-3.0-or-later',
    'Apache-2.0',
    'BSD-3-Clause',
    'GPL-2.0-only',
    'LGPL-2.1-or-later',
    'MPL-2.0'
  ];

  let {
    filters = $bindable<SearchFilters>({}),
    sort = $bindable<ExtendedSortOrder>('relevance'),
    totalCount = 0,
    filteredCount = 0,
    availableLicenses = POPULAR_LICENSES,
    letterCounts = {}
  }: {
    filters?: SearchFilters;
    sort?: ExtendedSortOrder;
    totalCount?: number;
    filteredCount?: number;
    availableLicenses?: string[];
    letterCounts?: Record<string, number>;
  } = $props();

  let hasActiveFilters = $derived(
    Boolean(
      (filters.category && filters.category !== 'All') ||
      (filters.license && filters.license !== 'All') ||
      (filters.letter && filters.letter !== 'All') ||
      (filters.toolchain && filters.toolchain !== 'All') ||
      (filters.channel && filters.channel !== 'all') ||
      sort !== 'relevance'
    )
  );

  function setCategory(cat: string) {
    filters = { ...filters, category: cat === 'All' ? undefined : cat };
  }

  function setLetter(letter: string) {
    filters = { ...filters, letter: letter === 'All' ? undefined : letter };
  }

  function clearAll() {
    filters = {};
    sort = 'relevance';
  }
</script>

<div class="space-y-4">
  <!-- Top bar: Result Count + Active Filter Badges + Sorting & License selects -->
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <!-- Result count -->
    <div class="flex items-center gap-2 text-xs text-[#8891a8]">
      <span>Showing</span>
      <span class="font-mono font-semibold text-[#e8eaf0]">{filteredCount}</span>
      <span>of</span>
      <span class="font-mono font-semibold text-[#e8eaf0]">{totalCount}</span>
      <span>packages</span>

      {#if hasActiveFilters}
        <button
          type="button"
          onclick={clearAll}
          class="ml-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-orange-400 hover:bg-orange-500/10 transition"
        >
          <RotateCcw class="h-3 w-3" />
          <span>Reset filters</span>
        </button>
      {/if}
    </div>

    <!-- Dropdowns: Stream, License, Toolchain, Sort -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Stream Dropdown -->
      <div class="relative flex items-center">
        <select
          value={filters.channel || 'all'}
          onchange={(e) => {
            const val = (e.target as HTMLSelectElement).value;
            filters = { ...filters, channel: val === 'all' ? undefined : (val as any) };
          }}
          class="appearance-none rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5 pr-7 text-xs text-[#e8eaf0] focus:border-orange-500 focus:outline-none transition cursor-pointer"
          aria-label="Filter by Stream"
        >
          <option value="all">All Streams</option>
          <option value="unstable">● Unstable Stream</option>
          <option value="volatile">▲ Volatile Stream Only</option>
        </select>
        <span class="pointer-events-none absolute right-2 text-[#8891a8] text-[10px]">▼</span>
      </div>

      <!-- License Dropdown -->
      <div class="relative flex items-center">
        <select
          value={filters.license || 'All'}
          onchange={(e) => {
            const val = (e.target as HTMLSelectElement).value;
            filters = { ...filters, license: val === 'All' ? undefined : val };
          }}
          class="appearance-none rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5 pr-7 text-xs text-[#e8eaf0] focus:border-orange-500 focus:outline-none transition cursor-pointer"
          aria-label="Filter by License"
        >
          <option value="All">All Licenses</option>
          {#each availableLicenses.filter(l => l !== 'All') as lic}
            <option value={lic}>{lic}</option>
          {/each}
        </select>
        <span class="pointer-events-none absolute right-2 text-[#8891a8] text-[10px]">▼</span>
      </div>

      <!-- Toolchain Dropdown -->
      <div class="relative flex items-center">
        <select
          value={filters.toolchain || 'All'}
          onchange={(e) => {
            const val = (e.target as HTMLSelectElement).value;
            filters = { ...filters, toolchain: val === 'All' ? undefined : val };
          }}
          class="appearance-none rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5 pr-7 text-xs text-[#e8eaf0] focus:border-orange-500 focus:outline-none transition cursor-pointer"
          aria-label="Filter by Toolchain"
        >
          <option value="All">All Toolchains</option>
          <option value="llvm">LLVM (Default)</option>
          <option value="gnu">GNU</option>
        </select>
        <span class="pointer-events-none absolute right-2 text-[#8891a8] text-[10px]">▼</span>
      </div>

      <!-- Sort Dropdown -->
      <div class="relative flex items-center">
        <ArrowUpDown class="pointer-events-none absolute left-2.5 h-3 w-3 text-[#8891a8]" />
        <select
          value={sort}
          onchange={(e) => sort = (e.target as HTMLSelectElement).value as ExtendedSortOrder}
          class="appearance-none rounded-lg border border-[#242836] bg-[#13161d] pl-8 pr-7 py-1.5 text-xs text-[#e8eaf0] focus:border-orange-500 focus:outline-none transition cursor-pointer"
          aria-label="Sort order"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
          <option value="recently-updated">Sort: Recently Updated</option>
          <option value="recently-added">Sort: Recently Added</option>
        </select>
        <span class="pointer-events-none absolute right-2 text-[#8891a8] text-[10px]">▼</span>
      </div>
    </div>
  </div>

  <!-- Category Pills -->
  <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
    {#each CATEGORIES as cat}
      {@const isSelected = (!filters.category && cat === 'All') || filters.category === cat}
      <button
        type="button"
        onclick={() => setCategory(cat)}
        class="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-all {isSelected ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-[#13161d] text-[#8891a8] border border-[#242836] hover:text-[#e8eaf0] hover:border-[#8891a8]/40'}"
      >
        {cat}
      </button>
    {/each}
  </div>

  <!-- Alphabet Letters Bar -->
  <div class="flex items-center gap-1 overflow-x-auto py-1 text-xs no-scrollbar border-t border-[#242836]/40 pt-2.5">
    {#each ALPHABET as letter}
      {@const isSelected = (!filters.letter && letter === 'All') || filters.letter === letter}
      {@const count = letter === 'All' ? totalCount : (letterCounts[letter.toLowerCase()] || 0)}
      {@const hasItems = letter === 'All' || count > 0}
      <button
        type="button"
        disabled={!hasItems}
        onclick={() => setLetter(letter)}
        class="flex h-7 min-w-7 items-center justify-center rounded px-1.5 font-mono text-[11px] font-medium transition-all {isSelected ? 'bg-orange-500 text-black font-bold' : hasItems ? 'bg-[#13161d] text-[#8891a8] hover:bg-[#1a1e28] hover:text-[#e8eaf0]' : 'text-[#8891a8]/30 cursor-not-allowed'}"
        title={letter === 'All' ? 'All packages' : `${count} packages starting with ${letter}`}
      >
        {letter}
      </button>
    {/each}
  </div>

  <!-- Active filter badges line -->
  {#if hasActiveFilters}
    <div class="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
      <span class="text-[11px] text-[#8891a8]">Filters:</span>

      {#if filters.channel && filters.channel !== 'all'}
        <span class="inline-flex items-center gap-1 rounded bg-[#1a1e28] border border-[#242836] px-2 py-0.5 text-xs text-orange-300">
          <span>Stream: {filters.channel === 'unstable' ? 'unstable' : (filters.channel === 'volatile' ? 'volatile only' : filters.channel)}</span>
          <button type="button" onclick={() => filters = { ...filters, channel: undefined }} class="hover:text-white">
            <X class="h-3 w-3" />
          </button>
        </span>
      {/if}

      {#if filters.category && filters.category !== 'All'}
        <span class="inline-flex items-center gap-1 rounded bg-[#1a1e28] border border-[#242836] px-2 py-0.5 text-xs text-orange-300">
          <span>Category: {filters.category}</span>
          <button type="button" onclick={() => filters = { ...filters, category: undefined }} class="hover:text-white">
            <X class="h-3 w-3" />
          </button>
        </span>
      {/if}

      {#if filters.license && filters.license !== 'All'}
        <span class="inline-flex items-center gap-1 rounded bg-[#1a1e28] border border-[#242836] px-2 py-0.5 text-xs text-orange-300">
          <span>License: {filters.license}</span>
          <button type="button" onclick={() => filters = { ...filters, license: undefined }} class="hover:text-white">
            <X class="h-3 w-3" />
          </button>
        </span>
      {/if}

      {#if filters.letter && filters.letter !== 'All'}
        <span class="inline-flex items-center gap-1 rounded bg-[#1a1e28] border border-[#242836] px-2 py-0.5 text-xs text-orange-300">
          <span>Letter: {filters.letter}</span>
          <button type="button" onclick={() => filters = { ...filters, letter: undefined }} class="hover:text-white">
            <X class="h-3 w-3" />
          </button>
        </span>
      {/if}

      {#if filters.toolchain && filters.toolchain !== 'All'}
        <span class="inline-flex items-center gap-1 rounded bg-[#1a1e28] border border-[#242836] px-2 py-0.5 text-xs text-orange-300">
          <span>Toolchain: {filters.toolchain.toUpperCase()}</span>
          <button type="button" onclick={() => filters = { ...filters, toolchain: undefined }} class="hover:text-white">
            <X class="h-3 w-3" />
          </button>
        </span>
      {/if}

      {#if sort !== 'relevance'}
        <span class="inline-flex items-center gap-1 rounded bg-[#1a1e28] border border-[#242836] px-2 py-0.5 text-xs text-[#8891a8]">
          <span>Sorted: {sort}</span>
          <button type="button" onclick={() => sort = 'relevance'} class="hover:text-white">
            <X class="h-3 w-3" />
          </button>
        </span>
      {/if}
    </div>
  {/if}
</div>
