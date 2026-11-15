<script lang="ts">
  import type { Package } from '$lib/data/types';
  import { compareStore } from '$lib/stores/compare.svelte';
  import { highlightMatches } from '$lib/utils/search';
  import { formatDomain, installCommand } from '$lib/utils/format';
  import { copyToClipboard } from '$lib/utils/clipboard';
  import {
    Copy,
    Check,
    Scale,
    ExternalLink,
    Terminal,
    Box,
    Layers
  } from 'lucide-svelte';

  let {
    pkg,
    searchQuery = '',
    compact = false
  }: {
    pkg: Package;
    searchQuery?: string;
    compact?: boolean;
  } = $props();

  let copied = $state(false);
  let isCompared = $derived(compareStore.has(pkg.name));

  async function copyInstallCommand(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const cmd = installCommand(pkg.name);
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

{#if compact}
  <!-- Compact list row -->
  <div
    class="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#242836] bg-[#13161d] p-3 transition-all duration-150 hover:border-orange-500/40 hover:bg-[#1a1e28]"
  >
    <div class="flex items-center gap-3 min-w-0">
      <a href="#/package/{pkg.name}" class="font-bold text-sm text-[#e8eaf0] hover:text-orange-400 truncate">
        {@html highlightMatches(pkg.name, searchQuery)}
      </a>

      <span class="rounded bg-[#1a1e28] px-1.5 py-0.5 font-mono text-[11px] text-[#8891a8] border border-[#242836] shrink-0">
        v{pkg.version}-{pkg.release}
      </span>

      {#if pkg.category}
        <span class="hidden sm:inline-block rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-400 border border-orange-500/20 shrink-0">
          {pkg.category}
        </span>
      {/if}

      <p class="hidden md:block truncate text-xs text-[#8891a8] max-w-md">
        {@html highlightMatches(pkg.summary || pkg.description || '', searchQuery)}
      </p>
    </div>

    <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
      <button
        type="button"
        onclick={toggleCompare}
        class="flex items-center gap-1 rounded px-2 py-1 text-xs transition {isCompared ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-[#8891a8] hover:text-[#e8eaf0] hover:bg-[#13161d]'}"
        title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
      >
        <Scale class="h-3.5 w-3.5" />
        <span class="hidden lg:inline">{isCompared ? 'Compared' : 'Compare'}</span>
      </button>

      <button
        type="button"
        onclick={copyInstallCommand}
        class="flex items-center gap-1 rounded bg-[#1a1e28] px-2.5 py-1 font-mono text-xs text-[#8891a8] border border-[#242836] hover:border-orange-500/50 hover:text-[#e8eaf0] transition"
        title="Copy: {installCommand(pkg.name)}"
      >
        {#if copied}
          <Check class="h-3.5 w-3.5 text-emerald-400" />
          <span class="text-emerald-400">Copied!</span>
        {:else}
          <Copy class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">moss add</span>
        {/if}
      </button>
    </div>
  </div>
{:else}
  <!-- Standard Rich Card -->
  <div
    class="group flex flex-col justify-between rounded-xl border border-[#242836] bg-[#13161d] p-5 shadow-sm transition-all duration-200 hover:border-orange-500/40 hover:bg-[#151922] hover:shadow-lg hover:shadow-black/40"
  >
    <!-- Card Top Header -->
    <div>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <a
            href="#/package/{pkg.name}"
            class="text-base font-bold text-[#e8eaf0] tracking-tight group-hover:text-orange-400 transition-colors block truncate"
          >
            {@html highlightMatches(pkg.name, searchQuery)}
          </a>
          <div class="mt-1 flex flex-wrap items-center gap-1.5">
            <!-- Version pill -->
            <span class="rounded bg-[#1a1e28] px-2 py-0.5 font-mono text-[11px] font-medium text-[#8891a8] border border-[#242836]">
              v{pkg.version}-{pkg.release}
            </span>

            <!-- Category badge -->
            {#if pkg.category}
              <a
                href="#/categories/{encodeURIComponent(pkg.category)}"
                class="rounded bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition"
              >
                {pkg.category}
              </a>
            {/if}

            <!-- License badge -->
            <span class="rounded bg-[#1a1e28] px-1.5 py-0.5 text-[10px] text-[#8891a8] border border-[#242836] max-w-[120px] truncate" title={pkg.license?.join(', ')}>
              {primaryLicense}
            </span>
          </div>
        </div>

        <!-- Add to Compare Toggle -->
        <button
          type="button"
          onclick={toggleCompare}
          class="shrink-0 rounded-lg p-1.5 text-xs transition {isCompared ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'border border-[#242836] bg-[#1a1e28] text-[#8891a8] hover:text-[#e8eaf0] hover:border-[#8891a8]/40'}"
          title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
          aria-label="Toggle compare"
        >
          <Scale class="h-4 w-4" />
        </button>
      </div>

      <!-- Summary / Description -->
      <p class="mt-3 text-xs leading-relaxed text-[#8891a8] line-clamp-2">
        {@html highlightMatches(pkg.summary || pkg.description || 'No description provided.', searchQuery)}
      </p>

      <!-- Subpackage count or deps indicators -->
      <div class="mt-3 flex items-center gap-3 text-[11px] text-[#8891a8]/80">
        {#if pkg.packages && pkg.packages.length > 0}
          <span class="flex items-center gap-1" title="{pkg.packages.length} subpackages defined">
            <Layers class="h-3 w-3 text-orange-400/80" />
            <span>{pkg.packages.length} subpackages</span>
          </span>
        {/if}

        {#if pkg.builddeps && pkg.builddeps.length > 0}
          <span class="flex items-center gap-1">
            <Box class="h-3 w-3 text-sky-400/80" />
            <span>{pkg.builddeps.length} deps</span>
          </span>
        {/if}

        {#if pkg.toolchain && pkg.toolchain !== 'llvm'}
          <span class="rounded bg-amber-500/10 px-1 text-[10px] font-mono text-amber-400 border border-amber-500/20">
            {pkg.toolchain}
          </span>
        {/if}

        {#if pkg.emul32}
          <span class="rounded bg-purple-500/10 px-1 text-[10px] font-mono text-purple-400 border border-purple-500/20">
            emul32
          </span>
        {/if}
      </div>
    </div>

    <!-- Card Bottom Footer: Install Button & Upstream Domain -->
    <div class="mt-5 pt-3 border-t border-[#242836]/60 flex items-center justify-between gap-2">
      <!-- Upstream Link -->
      {#if pkg.homepage}
        <a
          href={pkg.homepage}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 text-[11px] text-[#8891a8] hover:text-orange-400 transition truncate max-w-[140px]"
          title="Visit upstream homepage: {pkg.homepage}"
        >
          <ExternalLink class="h-3 w-3 shrink-0" />
          <span class="truncate">{domain}</span>
        </a>
      {:else}
        <div></div>
      {/if}

      <!-- Quick Moss Install Command Button -->
      <button
        type="button"
        onclick={copyInstallCommand}
        class="inline-flex items-center gap-1.5 rounded-lg border border-[#242836] bg-[#1a1e28] px-2.5 py-1 font-mono text-xs text-[#e8eaf0] transition hover:border-orange-500/50 hover:bg-[#202533] active:scale-95"
        title="Click to copy install command"
      >
        {#if copied}
          <Check class="h-3.5 w-3.5 text-emerald-400" />
          <span class="text-emerald-400 font-sans text-xs font-semibold">Copied!</span>
        {:else}
          <Terminal class="h-3.5 w-3.5 text-orange-400" />
          <span class="text-[11px] text-[#8891a8]">sudo moss add</span>
          <Copy class="h-3 w-3 text-[#8891a8] opacity-70" />
        {/if}
      </button>
    </div>
  </div>
{/if}
