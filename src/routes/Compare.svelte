<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import { compareStore } from '$lib/stores/compare.svelte';
  import PackageComparison from '$lib/components/package/PackageComparison.svelte';
  import { Plus, Search, Scale, AlertCircle } from 'lucide-svelte';

  let searchInput = $state('');
  let isSelectorOpen = $state(false);

  let searchResults = $derived.by(() => {
    if (!searchInput.trim()) return [];
    const q = searchInput.trim().toLowerCase();
    return packageStore.packages
      .filter(p => !compareStore.has(p.name) && (p.name.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)))
      .slice(0, 6);
  });

  function selectPackage(pkg: any) {
    compareStore.add(pkg);
    searchInput = '';
    isSelectorOpen = false;
  }
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
  <!-- Top Intro & Add to Compare selector -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#242836] pb-6">
    <div>
      <div class="flex items-center gap-2">
        <Scale class="h-5 w-5 text-orange-400" />
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#e8eaf0]">
          Package Comparison Matrix
        </h1>
      </div>
      <p class="mt-1 text-xs sm:text-sm text-[#8891a8]">
        Select up to 4 packages to inspect recipes, licenses, subpackages, and build requirements side-by-side.
      </p>
    </div>

    <!-- Add package selector dropdown -->
    {#if !compareStore.isFull}
      <div class="relative w-full md:w-72">
        <div class="relative flex items-center">
          <Search class="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#8891a8]" />
          <input
            type="text"
            bind:value={searchInput}
            onfocus={() => isSelectorOpen = true}
            placeholder="Add package to compare..."
            class="w-full rounded-xl border border-[#242836] bg-[#13161d] pl-9 pr-3 py-2 text-xs text-[#e8eaf0] placeholder-[#8891a8] focus:border-orange-500 focus:outline-none transition"
          />
        </div>

        {#if isSelectorOpen && searchResults.length > 0}
          <div class="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-[#242836] bg-[#13161d] p-1 shadow-xl">
            {#each searchResults as result}
              <button
                type="button"
                onclick={() => selectPackage(result)}
                class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-[#e8eaf0] hover:bg-[#1a1e28] transition group"
              >
                <div>
                  <span class="font-bold group-hover:text-orange-400 transition">{result.name}</span>
                  <span class="ml-1 text-[11px] text-[#8891a8] font-mono">v{result.version}</span>
                </div>
                <Plus class="h-3.5 w-3.5 text-[#8891a8] group-hover:text-orange-400" />
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div class="rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 text-xs text-orange-400">
        Maximum 4 packages selected for comparison.
      </div>
    {/if}
  </div>

  <!-- Comparison Matrix Component -->
  <PackageComparison />
</div>
