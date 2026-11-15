<script lang="ts">
  import type { SearchFilters } from '$lib/data/types';
  import type { ExtendedSortOrder } from '$lib/utils/search';

  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

  let {
    filters = $bindable<SearchFilters>({}),
    sort = $bindable<ExtendedSortOrder>('relevance'),
    totalCount = 0,
    filteredCount = 0,
    availableLicenses = [],
    letterCounts = {},
    categories = []
  }: {
    filters?: SearchFilters;
    sort?: ExtendedSortOrder;
    totalCount?: number;
    filteredCount?: number;
    availableLicenses?: string[];
    letterCounts?: Record<string, number>;
    categories?: string[];
  } = $props();

  let hasActiveFilters = $derived(
    Boolean(
      filters.category ||
        filters.license ||
        filters.letter ||
        filters.toolchain ||
        (filters.channel && filters.channel !== 'all') ||
        sort !== 'relevance'
    )
  );

  function clearAll() {
    filters = {};
    sort = 'relevance';
  }

  function setLetter(letter: string) {
    filters = { ...filters, letter: filters.letter?.toLowerCase() === letter ? undefined : letter.toUpperCase() };
  }

  const selectClass =
    'rounded border border-line bg-surface px-2 py-1 text-sm text-fg focus:border-accent focus:outline-none';
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
    <label class="flex items-center gap-1.5 text-muted">
      Category
      <select
        class={selectClass}
        value={filters.category ?? ''}
        onchange={(e) => {
          const v = (e.currentTarget as HTMLSelectElement).value;
          filters = { ...filters, category: v || undefined };
        }}
      >
        <option value="">any</option>
        {#each categories as cat}
          <option value={cat}>{cat}</option>
        {/each}
      </select>
    </label>

    <label class="flex items-center gap-1.5 text-muted">
      Stream
      <select
        class={selectClass}
        value={filters.channel ?? 'all'}
        onchange={(e) => {
          const v = (e.currentTarget as HTMLSelectElement).value;
          filters = { ...filters, channel: v === 'all' ? undefined : (v as SearchFilters['channel']) };
        }}
      >
        <option value="all">any</option>
        <option value="unstable">unstable</option>
        <option value="volatile">volatile only</option>
      </select>
    </label>

    <label class="flex items-center gap-1.5 text-muted">
      License
      <select
        class="{selectClass} max-w-40"
        value={filters.license ?? ''}
        onchange={(e) => {
          const v = (e.currentTarget as HTMLSelectElement).value;
          filters = { ...filters, license: v || undefined };
        }}
      >
        <option value="">any</option>
        {#each availableLicenses.filter((l) => l !== 'All') as lic}
          <option value={lic}>{lic}</option>
        {/each}
      </select>
    </label>

    <label class="flex items-center gap-1.5 text-muted">
      Toolchain
      <select
        class={selectClass}
        value={filters.toolchain ?? ''}
        onchange={(e) => {
          const v = (e.currentTarget as HTMLSelectElement).value;
          filters = { ...filters, toolchain: v || undefined };
        }}
      >
        <option value="">any</option>
        <option value="llvm">llvm (default)</option>
        <option value="gnu">gnu</option>
      </select>
    </label>

  </div>

  <nav class="no-scrollbar flex gap-0.5 overflow-x-auto font-mono text-sm" aria-label="Filter by first letter">
    {#each ALPHABET as letter}
      {@const count = letterCounts[letter] || 0}
      {@const selected = filters.letter?.toLowerCase() === letter}
      <button
        type="button"
        disabled={count === 0}
        aria-pressed={selected}
        onclick={() => setLetter(letter)}
        title="{count} packages starting with {letter}"
        class="h-7 min-w-7 rounded px-1 {selected ? 'bg-accent text-page' : count === 0 ? 'text-line' : 'text-muted hover:text-fg'}"
      >
        {letter}
      </button>
    {/each}
  </nav>

  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
    <p class="text-muted">
      {#if filteredCount === totalCount}
        {totalCount} packages
      {:else}
        {filteredCount} of {totalCount} packages
      {/if}
      {#if hasActiveFilters}
        · <button type="button" class="act" onclick={clearAll}>reset filters</button>
      {/if}
    </p>
      <label class="flex items-center gap-1.5 text-muted">
        Sort
        <select
          class={selectClass}
          value={sort}
          onchange={(e) => (sort = (e.currentTarget as HTMLSelectElement).value as ExtendedSortOrder)}
        >
          <option value="relevance">relevance</option>
          <option value="name-asc">name, A to Z</option>
          <option value="name-desc">name, Z to A</option>
          <option value="recently-updated">recently updated</option>
          <option value="recently-added">recently added</option>
        </select>
      </label>
  </div>
</div>
