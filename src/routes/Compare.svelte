<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import { compareStore } from '$lib/stores/compare.svelte';
  import type { Package } from '$lib/data/types';
  import PackageComparison from '$lib/components/package/PackageComparison.svelte';

  let searchInput = $state('');

  let searchResults = $derived.by(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return [];
    return packageStore.packages
      .filter((p) => !compareStore.has(p.name) && (p.name.toLowerCase().includes(q) || (p.summary || '').toLowerCase().includes(q)))
      .slice(0, 6);
  });

  function selectPackage(pkg: Package) {
    compareStore.add(pkg);
    searchInput = '';
  }
</script>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
  <h1 class="text-xl font-semibold">Compare</h1>
  <p class="mt-1 text-muted">Put up to four recipes side by side. Add them here or with “compare” on any package.</p>

  <div class="mt-5 max-w-sm">
    {#if !compareStore.isFull}
      <input
        type="search"
        bind:value={searchInput}
        placeholder="Add a package by name"
        aria-label="Add a package to compare"
        class="w-full rounded border border-line bg-surface px-3 py-2 placeholder:text-muted focus:border-accent focus:outline-none"
        autocomplete="off"
        spellcheck="false"
      />
      {#if searchResults.length > 0}
        <ul class="mt-1 divide-y divide-line rounded border border-line bg-surface">
          {#each searchResults as result}
            <li>
              <button type="button" onclick={() => selectPackage(result)} class="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left hover:bg-raised">
                <span class="font-mono">{result.name}</span>
                <span class="font-mono text-sm text-muted">{result.version}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    {:else}
      <p class="text-sm text-muted">Four packages selected, which is the maximum. Remove one to add another.</p>
    {/if}
  </div>

  <div class="mt-8">
    <PackageComparison />
  </div>
</div>
