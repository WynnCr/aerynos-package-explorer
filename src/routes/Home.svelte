<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import type { SearchFilters } from '$lib/data/types';
  import { searchPackages, type ExtendedSortOrder } from '$lib/utils/search';
  import { formatDate, formatAbsoluteDate } from '$lib/utils/format';
  import SearchBar from '$lib/components/search/SearchBar.svelte';
  import FilterPanel from '$lib/components/search/FilterPanel.svelte';
  import PackageCard from '$lib/components/package/PackageCard.svelte';
  import {
    LayoutGrid,
    List,
    Package,
    Shield,
    Layers,
    Clock,
    Sparkles,
    RotateCcw,
    Code,
    Terminal,
    Server,
    Monitor,
    Cpu,
    ExternalLink
  } from 'lucide-svelte';

  let searchQuery = $state('');
  let filters = $state<SearchFilters>({});
  let sort = $state<ExtendedSortOrder>('relevance');
  let viewMode = $state<'grid' | 'list'>('grid');
  let displayLimit = $state(36);

  // Compute live stats
  let totalCount = $derived(packageStore.packages.length);
  
  let uniqueLicenses = $derived(
    Array.from(new Set(packageStore.packages.flatMap(p => p.license || []))).filter(Boolean)
  );

  let uniqueCategories = $derived(
    Array.from(new Set(packageStore.packages.map(p => p.category || 'Other'))).filter(Boolean)
  );

  let letterCounts = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const p of packageStore.packages) {
      const l = (p.letter || p.name[0] || '').toLowerCase();
      if (l) counts[l] = (counts[l] || 0) + 1;
    }
    return counts;
  });

  // Filtered & sorted results
  let filteredList = $derived(
    searchPackages(packageStore.packages, searchQuery, filters, sort)
  );

  let visiblePackages = $derived(filteredList.slice(0, displayLimit));

  // Quick Discovery Picks
  let recentlyUpdated = $derived(
    [...packageStore.packages]
      .sort((a, b) => b.release - a.release)
      .slice(0, 4)
  );

  let isSearchingOrFiltered = $derived(
    Boolean(
      searchQuery.trim() ||
      filters.category ||
      filters.license ||
      filters.letter ||
      filters.toolchain ||
      sort !== 'relevance'
    )
  );

  function resetAll() {
    searchQuery = '';
    filters = {};
    sort = 'relevance';
  }
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
  <!-- Hero Section -->
  <section class="relative overflow-hidden rounded-2xl border border-[#242836] bg-gradient-to-b from-[#161a24] to-[#10131a] p-8 sm:p-12 text-center shadow-2xl">
    <div class="mx-auto max-w-3xl space-y-4">
      <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
        <Sparkles class="h-3.5 w-3.5" />
        <span>AerynOS Package Discovery Portal</span>
      </div>

      <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#e8eaf0]">
        Explore <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">AerynOS</span> Packages
      </h1>

      <p class="text-sm sm:text-base text-[#8891a8] max-w-2xl mx-auto leading-relaxed">
        Search, discover, and inspect packages available in the modern, atomic AerynOS ecosystem. Built with <code class="text-orange-300 font-mono text-xs">boulder</code> recipes and installed with <code class="text-orange-300 font-mono text-xs">moss</code>.
      </p>

      <!-- Prominent Hero Search Bar -->
      <div class="pt-4 max-w-2xl mx-auto">
        <SearchBar bind:value={searchQuery} autofocus={false} />
      </div>

      <!-- Live Statistics Pills -->
      <div class="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#8891a8]">
        <div class="inline-flex items-center gap-1.5 rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5">
          <Package class="h-3.5 w-3.5 text-orange-400" />
          <span class="font-mono font-bold text-[#e8eaf0]">{totalCount}</span>
          <span>Packages</span>
        </div>

        {#if packageStore.channelStats}
          <button
            type="button"
            onclick={() => { filters = { ...filters, channel: filters.channel === 'unstable' ? undefined : 'unstable' }; }}
            class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition cursor-pointer {filters.channel === 'unstable' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200' : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'}"
            title="Click to filter packages ready in unstable"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span class="font-mono font-bold text-emerald-400">{packageStore.channelStats.bothCount}</span>
            <span class="text-emerald-300">in unstable</span>
          </button>

          <button
            type="button"
            onclick={() => { filters = { ...filters, channel: filters.channel === 'volatile' ? undefined : 'volatile' }; }}
            class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition cursor-pointer {filters.channel === 'volatile' ? 'border-amber-500 bg-amber-500/25 text-amber-200' : 'border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/20'}"
            title="Click to filter packages currently in volatile staging only"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            <span class="font-mono font-bold text-amber-400">{packageStore.channelStats.volatileOnlyCount}</span>
            <span class="text-amber-300">volatile only</span>
          </button>
        {/if}

        <div class="inline-flex items-center gap-1.5 rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5">
          <Layers class="h-3.5 w-3.5 text-sky-400" />
          <span class="font-mono font-bold text-[#e8eaf0]">{uniqueCategories.length}</span>
          <span>Categories</span>
        </div>

        <div class="inline-flex items-center gap-1.5 rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5" title={packageStore.generatedAt ? formatAbsoluteDate(packageStore.generatedAt) : ''}>
          <Clock class="h-3.5 w-3.5 text-purple-400" />
          <span>Updated:</span>
          <span class="font-semibold text-[#e8eaf0]">{packageStore.generatedAt ? formatDate(packageStore.generatedAt) : 'Live'}</span>
        </div>
      </div>

      <!-- Channel Notice Banner -->
      <div class="mt-3 mx-auto max-w-2xl rounded-xl border border-[#242836] bg-[#0d0f14]/80 px-4 py-2 text-xs text-[#8891a8] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-left">
          <span class="flex h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span>
            Indexing official recipes across both <span class="font-mono text-emerald-400">unstable</span> and <span class="font-mono text-amber-400">volatile</span> (staging) streams.
          </span>
        </div>
        <a href="#/about" class="text-orange-400 hover:underline shrink-0 text-[11px] font-medium">
          Channel guide →
        </a>
      </div>
    </div>
  </section>

  <!-- If not actively searching/filtering, show Quick Category Pills -->
  {#if !isSearchingOrFiltered}
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-[#8891a8]">
          Browse by Category
        </h2>
        <a href="#/categories" class="text-xs text-orange-400 hover:underline">
          View all categories →
        </a>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {#each [
          { name: 'Development', icon: Code, color: 'text-amber-400' },
          { name: 'System', icon: Server, color: 'text-blue-400' },
          { name: 'Desktop', icon: Monitor, color: 'text-indigo-400' },
          { name: 'Utilities', icon: Terminal, color: 'text-emerald-400' },
          { name: 'Security', icon: Shield, color: 'text-red-400' },
          { name: 'Languages', icon: Cpu, color: 'text-purple-400' }
        ] as cat}
          {@const catCount = packageStore.packages.filter(p => p.category === cat.name).length}
          <button
            type="button"
            onclick={() => filters = { ...filters, category: cat.name }}
            class="flex items-center justify-between rounded-xl border border-[#242836] bg-[#13161d] p-3 text-left transition hover:border-orange-500/50 hover:bg-[#1a1e28] group"
          >
            <div class="flex items-center gap-2 min-w-0">
              <cat.icon class="h-4 w-4 {cat.color} shrink-0" />
              <span class="text-xs font-semibold text-[#e8eaf0] group-hover:text-orange-400 transition truncate">
                {cat.name}
              </span>
            </div>
            <span class="rounded bg-[#1a1e28] px-1.5 py-0.5 font-mono text-[10px] text-[#8891a8]">
              {catCount}
            </span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Main Search & Filtering Controls -->
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#242836] pb-4">
      <div>
        <h2 class="text-lg font-bold text-[#e8eaf0]">
          {isSearchingOrFiltered ? 'Search Results' : 'All Packages'}
        </h2>
        <p class="text-xs text-[#8891a8]">
          Instant client-side index with fuzzy search across names, summaries, descriptions, and builddeps.
        </p>
      </div>

      <!-- View layout toggle (Grid vs List) -->
      <div class="flex items-center gap-1 self-end sm:self-auto rounded-lg border border-[#242836] bg-[#13161d] p-1">
        <button
          type="button"
          onclick={() => viewMode = 'grid'}
          class="rounded p-1.5 transition {viewMode === 'grid' ? 'bg-[#1a1e28] text-orange-400 shadow-sm' : 'text-[#8891a8] hover:text-[#e8eaf0]'}"
          title="Grid view"
          aria-label="Grid view"
        >
          <LayoutGrid class="h-4 w-4" />
        </button>
        <button
          type="button"
          onclick={() => viewMode = 'list'}
          class="rounded p-1.5 transition {viewMode === 'list' ? 'bg-[#1a1e28] text-orange-400 shadow-sm' : 'text-[#8891a8] hover:text-[#e8eaf0]'}"
          title="List view"
          aria-label="List view"
        >
          <List class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Filter Panel -->
    <FilterPanel
      bind:filters
      bind:sort
      totalCount={totalCount}
      filteredCount={filteredList.length}
      availableLicenses={['All', ...uniqueLicenses]}
      {letterCounts}
    />

    <!-- Package List or Empty State -->
    {#if packageStore.loading}
      <div class="rounded-xl border border-[#242836] bg-[#13161d] p-16 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
        <p class="mt-4 text-sm text-[#8891a8]">Loading package index...</p>
      </div>
    {:else if filteredList.length === 0}
      <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-12 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1e28] text-orange-400 border border-[#242836]">
          <Package class="h-6 w-6" />
        </div>
        <h3 class="mt-4 text-base font-semibold text-[#e8eaf0]">No matching packages found</h3>
        <p class="mt-1 text-xs text-[#8891a8] max-w-sm mx-auto">
          We couldn't find any packages matching your query or active filters. Try searching for another term or reset your filters.
        </p>
        <button
          type="button"
          onclick={resetAll}
          class="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-black hover:bg-orange-400 transition"
        >
          <RotateCcw class="h-3.5 w-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    {:else}
      <!-- Package Display -->
      {#if viewMode === 'grid'}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each visiblePackages as pkg (pkg.name)}
            <PackageCard {pkg} {searchQuery} compact={false} />
          {/each}
        </div>
      {:else}
        <div class="space-y-2">
          {#each visiblePackages as pkg (pkg.name)}
            <PackageCard {pkg} {searchQuery} compact={true} />
          {/each}
        </div>
      {/if}

      <!-- Pagination / Load more -->
      {#if visiblePackages.length < filteredList.length}
        <div class="pt-6 text-center">
          <button
            type="button"
            onclick={() => displayLimit += 36}
            class="inline-flex items-center gap-2 rounded-xl border border-[#242836] bg-[#13161d] px-6 py-2.5 text-xs font-semibold text-[#e8eaf0] hover:border-orange-500/50 hover:bg-[#1a1e28] transition"
          >
            <span>Load More Packages</span>
            <span class="rounded bg-[#1a1e28] px-1.5 py-0.5 font-mono text-[10px] text-orange-400 border border-[#242836]">
              {filteredList.length - visiblePackages.length} remaining
            </span>
          </button>
        </div>
      {/if}
    {/if}
  </section>

  <!-- Recently Updated Section (when browsing default view) -->
  {#if !isSearchingOrFiltered && recentlyUpdated.length > 0}
    <section class="border-t border-[#242836] pt-10">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-base font-bold text-[#e8eaf0]">Recently Updated Recipes</h2>
          <p class="text-xs text-[#8891a8]">Packages with recent release updates in the recipes tree.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each recentlyUpdated as pkg}
          <PackageCard {pkg} />
        {/each}
      </div>
    </section>
  {/if}
</div>
