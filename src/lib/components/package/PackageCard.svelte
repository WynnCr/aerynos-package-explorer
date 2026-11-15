<script lang="ts">
  import type { Package } from '$lib/data/types';
  import { compareStore } from '$lib/stores/compare.svelte';
  import { highlightMatches } from '$lib/utils/search';
  import { formatDomain, installCommand, getBinaryPackages, getDefaultBinaryPackage } from '$lib/utils/format';
  import { copyToClipboard } from '$lib/utils/clipboard';

  let {
    pkg,
    searchQuery = '',
    compact = false
  }: {
    pkg: Package;
    searchQuery?: string;
    compact?: boolean;
  } = $props();

  let binaryOptions = $derived(getBinaryPackages(pkg));
  let selectedBinary = $state<string>('');

  $effect(() => {
    const def = getDefaultBinaryPackage(pkg);
    if (searchQuery && pkg.packages && pkg.packages.length > 0) {
      const q = searchQuery.toLowerCase().trim();
      // If the default package already matches the query, keep it ("curl" shouldn't pick "curl-libs").
      if (def.toLowerCase().includes(q)) {
        selectedBinary = def;
        return;
      }
      const match = pkg.packages.find(p => p.name.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q));
      if (match) {
        selectedBinary = match.name;
        return;
      }
    }
    selectedBinary = def;
  });

  let copied = $state(false);
  let isCompared = $derived(compareStore.has(pkg.name));

  async function copyInstallCommand(e: MouseEvent, binaryName?: string) {
    e.stopPropagation();
    e.preventDefault();
    const target = binaryName || selectedBinary || pkg.name;
    const cmd = installCommand(target);
    const success = await copyToClipboard(cmd);
    if (success) {
      copied = true;
      setTimeout(() => copied = false, 2000);
    }
  }

  function toggleCompare(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    compareStore.toggle(pkg);
  }

  let domain = $derived(pkg.homepage ? formatDomain(pkg.homepage) : '');
  let primaryLicense = $derived(pkg.license && pkg.license.length > 0 ? pkg.license[0] : 'Unknown');
</script>

{#snippet actions()}
  <div class="flex shrink-0 items-baseline gap-4">
    <button
      type="button"
      class="act"
      aria-pressed={isCompared}
      onclick={toggleCompare}
      title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
    >
      {isCompared ? 'comparing' : 'compare'}
    </button>

    {#if pkg.channel === 'volatile'}
      <span
        class="text-sm text-warn"
        title="Only in the volatile stream. Not available from the default unstable stream until promoted."
      >volatile only</span>
    {:else}
      <button
        type="button"
        class="act"
        onclick={(e) => copyInstallCommand(e, selectedBinary)}
        title={installCommand(selectedBinary || pkg.name)}
      >
        {copied ? 'copied' : 'copy command'}
      </button>
    {/if}
  </div>
{/snippet}

{#if compact}
  <article class="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
    <div class="min-w-0">
      <div class="flex flex-wrap items-baseline gap-x-3">
        <a href="#/package/{pkg.name}" class="font-mono font-medium hover:text-accent">{@html highlightMatches(pkg.name, searchQuery)}</a>
        <span
          class="font-mono text-sm text-muted"
          title="Version from stone.yaml on the main branch. The unstable stream may still ship an older one."
        >{pkg.version}-{pkg.release}</span>
        {#if pkg.category && pkg.category !== 'Other'}
          <span class="text-sm text-muted">{pkg.category}</span>
        {/if}
      </div>
      <p class="truncate text-sm text-muted">
        {@html highlightMatches(pkg.summary || pkg.description || '', searchQuery)}
      </p>
      {#if selectedBinary && selectedBinary !== pkg.name}
        <p class="font-mono text-xs text-muted">installs as {selectedBinary}</p>
      {/if}
    </div>
    {@render actions()}
  </article>
{:else}
  <article class="flex flex-col justify-between gap-3 rounded border border-line bg-surface p-4">
    <div class="min-w-0 space-y-1">
      <div class="flex flex-wrap items-baseline gap-x-3">
        <a href="#/package/{pkg.name}" class="font-mono font-medium hover:text-accent">{@html highlightMatches(pkg.name, searchQuery)}</a>
        <span
          class="font-mono text-sm text-muted"
          title="Version from stone.yaml on the main branch. The unstable stream may still ship an older one."
        >{pkg.version}-{pkg.release}</span>
      </div>

      <p class="line-clamp-2 text-sm text-muted">
        {@html highlightMatches(pkg.summary || pkg.description || 'No description.', searchQuery)}
      </p>

      <p class="flex flex-wrap gap-x-3 text-xs text-muted">
        {#if pkg.category}<a class="hover:text-fg" href="#/categories/{encodeURIComponent(pkg.category)}">{pkg.category}</a>{/if}
        <span>{primaryLicense}</span>
        {#if binaryOptions.length > 1}<span>{binaryOptions.length} binary packages</span>{/if}
        {#if pkg.toolchain && pkg.toolchain !== 'llvm'}<span>{pkg.toolchain}</span>{/if}
        {#if pkg.emul32}<span>emul32</span>{/if}
      </p>

      {#if selectedBinary && selectedBinary !== pkg.name}
        <p class="font-mono text-xs text-muted">installs as {selectedBinary}</p>
      {/if}
    </div>

    <div class="flex items-baseline justify-between gap-3 border-t border-line pt-3">
      {#if pkg.homepage}
        <a class="min-w-0 truncate text-sm text-muted hover:text-fg" href={pkg.homepage} target="_blank" rel="noopener noreferrer" title={pkg.homepage}>{domain}</a>
      {:else}
        <span></span>
      {/if}
      {@render actions()}
    </div>
  </article>
{/if}
