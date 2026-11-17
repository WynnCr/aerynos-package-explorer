<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import { searchPackages, type ExtendedSortOrder } from '$lib/utils/search';
  import SearchBar from '$lib/components/search/SearchBar.svelte';
  import PackageCard from '$lib/components/package/PackageCard.svelte';

  let { params = {} }: { params?: { category?: string } } = $props();

  let selectedCategory = $derived(params?.category ? decodeURIComponent(params.category) : null);
  let searchQuery = $state('');
  let sort = $state<ExtendedSortOrder>('relevance');

  const CATEGORY_DESC: Record<string, string> = {
    Development: 'Compilers, build systems, debuggers, and developer tooling.',
    System: 'Core system components, kernel, daemons, and base utilities.',
    Desktop: 'Wayland compositors, desktop shells, and window managers.',
    Networking: 'Network management, VPN, SSH, socket utilities, and HTTP clients.',
    Security: 'Cryptography, TLS/SSL, authentication, and root certificates.',
    Multimedia: 'Audio/video frameworks, codecs, media players, and streaming.',
    Graphics: 'Vulkan, OpenGL, Mesa, GPU compute, and rendering libraries.',
    Languages: 'Programming language compilers, runtimes, and interpreters.',
    Libraries: 'Shared C/C++ libraries, abstractions, and data format parsers.',
    Editors: 'Text editors and IDEs.',
    Fonts: 'System typefaces, coding fonts, and Unicode glyph sets.',
    Games: 'Gaming clients, emulators, and interactive applications.',
    Utilities: 'Command-line tools, terminal helpers, and shell environments.',
    Other: 'Specialized packages and unclassified ecosystem software.',
  };
  const FALLBACK_DESC = 'Packages that don\'t fit another category.';

  // Group packages by category
  let categoriesWithCounts = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const pkg of packageStore.packages) {
      const cat = pkg.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    }

    const allKeys = Object.keys(counts);
    return allKeys.map(cat => ({
      name: cat,
      count: counts[cat] || 0,
      desc: CATEGORY_DESC[cat] || FALLBACK_DESC
    })).sort((a, b) => b.count - a.count);
  });

  let selectedDesc = $derived(selectedCategory ? (CATEGORY_DESC[selectedCategory] || FALLBACK_DESC) : '');

  // Filtered packages for selected category
  let categoryPackages = $derived.by(() => {
    if (!selectedCategory) return [];
    const cat = selectedCategory;
    return searchPackages(packageStore.packages, searchQuery, { category: cat }, sort);
  });

  $effect(() => {
    if (selectedCategory) {
      window.scrollTo(0, 0);
    }
  });
</script>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
  {#if selectedCategory}
    <p class="mb-6 text-sm"><a class="link" href="#/categories">← All categories</a></p>

    <h1 class="text-xl font-semibold">{selectedCategory}</h1>
    <p class="mt-1 text-muted">{selectedDesc}</p>

    <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="flex-1">
        <SearchBar bind:value={searchQuery} placeholder="Search in {selectedCategory}" />
      </div>
      <label class="flex items-center gap-1.5 text-sm text-muted">
        Sort
        <select
          value={sort}
          onchange={(e) => (sort = (e.currentTarget as HTMLSelectElement).value as ExtendedSortOrder)}
          class="rounded border border-line bg-surface px-2 py-1 text-sm text-fg focus:border-accent focus:outline-none"
        >
          <option value="relevance">relevance</option>
          <option value="name-asc">name, A to Z</option>
          <option value="name-desc">name, Z to A</option>
        </select>
      </label>
    </div>

    <p class="mt-4 text-sm text-muted">{categoryPackages.length} packages</p>

    <div class="mt-2 border-t border-line">
      {#if categoryPackages.length === 0}
        <p class="py-8 text-muted">
          Nothing in {selectedCategory} matches “{searchQuery}”.
          <button type="button" class="link" onclick={() => (searchQuery = '')}>Clear the search</button>.
        </p>
      {:else}
        {#each categoryPackages as pkg (pkg.name)}
          <PackageCard {pkg} {searchQuery} compact={true} />
        {/each}
      {/if}
    </div>
  {:else}
    <h1 class="text-xl font-semibold">Categories</h1>
    <p class="mt-1 text-muted">
      Sorted into groups by keyword matching on names and descriptions. These are this site's guesses, not aerynOS metadata.
    </p>

    <div class="mt-6 border-t border-line">
      {#each categoriesWithCounts as cat}
        <a
          href="#/categories/{encodeURIComponent(cat.name)}"
          class="group flex items-baseline gap-4 border-b border-line py-3"
        >
          <span class="w-28 shrink-0 font-medium group-hover:text-accent">{cat.name}</span>
          <span class="min-w-0 flex-1 truncate text-sm text-muted">{cat.desc}</span>
          <span class="shrink-0 font-mono text-sm text-muted">{cat.count}</span>
        </a>
      {/each}
    </div>
  {/if}
</div>
