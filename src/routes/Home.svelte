<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import type { SearchFilters } from '$lib/data/types';
  import { searchPackages, type ExtendedSortOrder } from '$lib/utils/search';
  import { formatDate, formatAbsoluteDate } from '$lib/utils/format';
  import SearchBar from '$lib/components/search/SearchBar.svelte';
  import FilterPanel from '$lib/components/search/FilterPanel.svelte';
  import PackageCard from '$lib/components/package/PackageCard.svelte';

  let searchQuery = $state('');
  let filters = $state<SearchFilters>({});
  let sort = $state<ExtendedSortOrder>('relevance');
  let displayLimit = $state(50);

  let totalCount = $derived(packageStore.packages.length);

  let uniqueLicenses = $derived(
    Array.from(new Set(packageStore.packages.flatMap(p => p.license || []))).filter(Boolean).sort((a, b) => a.localeCompare(b))
  );

  let categories = $derived(
    Array.from(new Set(packageStore.packages.map(p => p.category || 'Other'))).sort((a, b) =>
      a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)
    )
  );

  let letterCounts = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const p of packageStore.packages) {
      const l = (p.letter || p.name[0] || '').toLowerCase();
      if (l) counts[l] = (counts[l] || 0) + 1;
    }
    return counts;
  });

  let filteredList = $derived(
    searchPackages(packageStore.packages, searchQuery, filters, sort)
  );

  let visiblePackages = $derived(filteredList.slice(0, displayLimit));

  function resetAll() {
    searchQuery = '';
    filters = {};
    sort = 'relevance';
  }
</script>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
  <h1 class="text-xl font-semibold">aerynOS packages</h1>
  <p class="mt-1 text-muted">
    Search the recipes in <a class="link" href="https://github.com/aerynOS/recipes">aerynOS/recipes</a>.
    This is an unofficial index; the aerynOS project doesn't run it.
  </p>

  <div class="mt-5">
    <SearchBar bind:value={searchQuery} />
  </div>

  <p class="mt-3 text-sm text-muted">
    {totalCount} recipes
    {#if packageStore.generatedAt}
      · indexed <span title={formatAbsoluteDate(packageStore.generatedAt)}>{formatDate(packageStore.generatedAt).toLowerCase()}</span>
    {/if}
    {#if packageStore.channelStats}
      ·
      <button
        type="button"
        class="act"
        aria-pressed={filters.channel === 'unstable'}
        onclick={() => { filters = { ...filters, channel: filters.channel === 'unstable' ? undefined : 'unstable' }; }}
      >{packageStore.channelStats.bothCount} in unstable (default)</button>,
      <button
        type="button"
        class="act"
        aria-pressed={filters.channel === 'volatile'}
        onclick={() => { filters = { ...filters, channel: filters.channel === 'volatile' ? undefined : 'volatile' }; }}
      >{packageStore.channelStats.volatileOnlyCount} volatile only</button>
    {/if}
  </p>

  <details class="mt-2 text-sm text-muted">
    <summary class="cursor-pointer hover:text-fg">Why can a version here differ from what moss installs?</summary>
    <p class="mt-2 max-w-2xl">
      Versions are read from <code>stone.yaml</code> on the main branch, which is the
      <em>volatile</em> stream. Systems follow the <em>unstable</em> stream (the default for aerynOS installs), which is only
      moved to a new tag once maintainers have checked a build, so it can lag behind.
      <a class="link" href="#/about">More on streams</a>.
    </p>
  </details>

  <div class="mt-8">
    <FilterPanel
      bind:filters
      bind:sort
      totalCount={totalCount}
      filteredCount={filteredList.length}
      availableLicenses={['All', ...uniqueLicenses]}
      {letterCounts}
      {categories}
    />
  </div>

  <section class="mt-4 border-t border-line" aria-live="polite">
    {#if packageStore.loading}
      <p class="py-12 text-muted">Loading the package index…</p>
    {:else if filteredList.length === 0}
      <div class="py-12">
        <p>Nothing matches{searchQuery.trim() ? ` “${searchQuery.trim()}”` : ''}.</p>
        <p class="mt-1 text-sm text-muted">
          Try a shorter query, or <button type="button" class="link" onclick={resetAll}>clear the search and filters</button>.
        </p>
      </div>
    {:else}
      {#each visiblePackages as pkg (pkg.name)}
        <PackageCard {pkg} {searchQuery} compact={true} />
      {/each}

      {#if visiblePackages.length < filteredList.length}
        <div class="py-6">
          <button
            type="button"
            onclick={() => (displayLimit += 50)}
            class="rounded border border-line px-4 py-1.5 text-sm hover:border-muted"
          >
            Show 50 more <span class="text-muted">({filteredList.length - visiblePackages.length} left)</span>
          </button>
        </div>
      {/if}
    {/if}
  </section>
</div>
