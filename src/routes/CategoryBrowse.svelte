<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import { searchPackages, type ExtendedSortOrder } from '$lib/utils/search';
  import SearchBar from '$lib/components/search/SearchBar.svelte';
  import PackageCard from '$lib/components/package/PackageCard.svelte';
  import {
    Code,
    Server,
    Monitor,
    Wifi,
    Shield,
    Film,
    Sparkles,
    Cpu,
    Layers,
    Type,
    Gamepad2,
    Terminal,
    Boxes,
    ArrowLeft,
    ArrowUpDown,
    RotateCcw
  } from 'lucide-svelte';

  let { params = {} }: { params?: { category?: string } } = $props();

  let selectedCategory = $derived(params?.category ? decodeURIComponent(params.category) : null);
  let searchQuery = $state('');
  let sort = $state<ExtendedSortOrder>('relevance');

  const CATEGORY_META: Record<string, { icon: any; desc: string; color: string }> = {
    Development: {
      icon: Code,
      desc: 'Compilers, build systems, debuggers, and developer tooling.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    System: {
      icon: Server,
      desc: 'Core system components, kernel, daemons, and base utilities.',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    Desktop: {
      icon: Monitor,
      desc: 'Wayland compositors, desktop shells, and window managers.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    Networking: {
      icon: Wifi,
      desc: 'Network management, VPN, SSH, socket utilities, and HTTP clients.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    Security: {
      icon: Shield,
      desc: 'Cryptography, TLS/SSL, authentication, and root certificates.',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    Multimedia: {
      icon: Film,
      desc: 'Audio/video frameworks, codecs, media players, and streaming.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    Graphics: {
      icon: Sparkles,
      desc: 'Vulkan, OpenGL, Mesa, GPU compute, and rendering libraries.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    Languages: {
      icon: Cpu,
      desc: 'Programming language compilers, runtimes, and interpreters.',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    },
    Libraries: {
      icon: Layers,
      desc: 'Shared C/C++ libraries, abstractions, and data format parsers.',
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    },
    Fonts: {
      icon: Type,
      desc: 'System typefaces, coding fonts, and Unicode glyph sets.',
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    },
    Games: {
      icon: Gamepad2,
      desc: 'Gaming clients, emulators, and interactive applications.',
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    },
    Utilities: {
      icon: Terminal,
      desc: 'Command-line tools, terminal helpers, and shell environments.',
      color: 'text-lime-400 bg-lime-500/10 border-lime-500/20'
    },
    Other: {
      icon: Boxes,
      desc: 'Specialized packages and unclassified ecosystem software.',
      color: 'text-[#8891a8] bg-[#1a1e28] border-[#242836]'
    }
  };

  // Group packages by category
  let categoriesWithCounts = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const pkg of packageStore.packages) {
      const cat = pkg.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    }

    const allKeys = Array.from(new Set([...Object.keys(CATEGORY_META), ...Object.keys(counts)]));
    return allKeys.map(cat => ({
      name: cat,
      count: counts[cat] || 0,
      meta: CATEGORY_META[cat] || CATEGORY_META.Other
    })).sort((a, b) => b.count - a.count);
  });

  let selectedMeta = $derived(
    selectedCategory ? (CATEGORY_META[selectedCategory] || CATEGORY_META.Other) : null
  );

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

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
  {#if selectedCategory}
    <!-- Detail View for Selected Category -->
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <a
          href="#/categories"
          class="inline-flex items-center gap-2 rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5 text-xs font-medium text-[#8891a8] hover:border-orange-500/50 hover:text-[#e8eaf0] transition"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          <span>All Categories</span>
        </a>
      </div>

      <!-- Category Header Card -->
      <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-6 sm:p-8">
        {#if selectedMeta}
          {@const meta = selectedMeta}
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl border {meta.color}">
                <meta.icon class="h-6 w-6" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold text-[#e8eaf0]">{selectedCategory}</h1>
                  <span class="rounded bg-[#1a1e28] px-2 py-0.5 font-mono text-xs text-orange-400 border border-[#242836]">
                    {categoryPackages.length} packages
                  </span>
                </div>
                <p class="mt-1 text-xs sm:text-sm text-[#8891a8]">{meta.desc}</p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Inline search within category -->
        <div class="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <div class="w-full">
            <SearchBar
              bind:value={searchQuery}
              placeholder="Search in {selectedCategory} packages..."
            />
          </div>

          <div class="relative flex items-center shrink-0 w-full sm:w-auto">
            <ArrowUpDown class="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#8891a8]" />
            <select
              value={sort}
              onchange={(e) => sort = (e.target as HTMLSelectElement).value as ExtendedSortOrder}
              class="w-full sm:w-auto appearance-none rounded-xl border border-[#242836] bg-[#13161d] pl-9 pr-8 py-3 text-xs text-[#e8eaf0] focus:border-orange-500 focus:outline-none transition cursor-pointer"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="recently-updated">Sort: Recently Updated</option>
            </select>
            <span class="pointer-events-none absolute right-3 text-[#8891a8] text-[10px]">▼</span>
          </div>
        </div>
      </div>

      <!-- Packages Grid -->
      {#if categoryPackages.length === 0}
        <div class="rounded-xl border border-[#242836] bg-[#13161d] p-12 text-center">
          <p class="text-sm text-[#8891a8]">No packages found matching "{searchQuery}" in {selectedCategory}.</p>
          <button
            type="button"
            onclick={() => searchQuery = ''}
            class="mt-3 inline-flex items-center gap-1 text-xs text-orange-400 hover:underline"
          >
            <RotateCcw class="h-3 w-3" />
            <span>Clear search filter</span>
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each categoryPackages as pkg (pkg.name)}
            <PackageCard {pkg} {searchQuery} />
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Grid of All Categories -->
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#e8eaf0]">
          Package Categories
        </h1>
        <p class="mt-1 text-xs sm:text-sm text-[#8891a8]">
          Explore the AerynOS package collection structured into logical software domains.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each categoriesWithCounts as cat}
          <a
            href="#/categories/{encodeURIComponent(cat.name)}"
            class="group flex flex-col justify-between rounded-xl border border-[#242836] bg-[#13161d] p-5 transition-all duration-200 hover:border-orange-500/40 hover:bg-[#1a1e28] hover:shadow-lg hover:shadow-black/30"
          >
            <div>
              <div class="flex items-center justify-between">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg border {cat.meta.color}">
                  <cat.meta.icon class="h-5 w-5" />
                </div>
                <span class="rounded bg-[#1a1e28] px-2 py-0.5 font-mono text-xs text-orange-400 border border-[#242836]">
                  {cat.count} {cat.count === 1 ? 'pkg' : 'pkgs'}
                </span>
              </div>

              <h2 class="mt-4 text-base font-bold text-[#e8eaf0] group-hover:text-orange-400 transition-colors">
                {cat.name}
              </h2>
              <p class="mt-1 text-xs text-[#8891a8] leading-relaxed line-clamp-2">
                {cat.meta.desc}
              </p>
            </div>

            <div class="mt-4 flex items-center gap-1 text-xs font-medium text-orange-400/80 group-hover:text-orange-400 transition">
              <span>Browse {cat.name} packages</span>
              <span>→</span>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
