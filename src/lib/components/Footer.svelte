<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import { formatDate, formatAbsoluteDate } from '$lib/utils/format';
  import { Package, GitCommit, Heart, ExternalLink } from 'lucide-svelte';

  let packageCount = $derived(packageStore.totalCount || packageStore.packages.length);
  let lastIndexed = $derived(packageStore.generatedAt ? formatDate(packageStore.generatedAt) : 'Recent');
  let absoluteIndexed = $derived(packageStore.generatedAt ? formatAbsoluteDate(packageStore.generatedAt) : '');
  let shortSha = $derived(packageStore.commitSha ? packageStore.commitSha.slice(0, 7) : null);
</script>

<footer class="mt-auto border-t border-[#242836] bg-[#0d0f14] py-10 text-xs text-[#8891a8]">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <!-- Left side: Description & Ecosystem info -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <span class="font-bold tracking-tight text-[#e8eaf0]">aeryn<span class="text-orange-500">OS</span></span>
          <span class="text-[#8891a8]">— Package Explorer</span>
          <span class="rounded bg-[#1a1e28] px-1.5 py-0.5 text-[9px] font-medium tracking-wider text-[#8891a8] uppercase border border-[#242836]">
            Unofficial
          </span>
        </div>
        <p class="max-w-md text-[#8891a8] leading-relaxed">
          An unofficial, community-maintained package discovery tool for AerynOS. Not affiliated with or endorsed by the official AerynOS project. For official distribution resources, visit <a href="https://aerynos.com" target="_blank" rel="noopener noreferrer" class="text-[#e8eaf0] hover:underline">aerynos.com</a> and <a href="https://aerynos.dev" target="_blank" rel="noopener noreferrer" class="text-[#e8eaf0] hover:underline">aerynos.dev</a>.
        </p>
      </div>

      <!-- Right side: Stats pill & links -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <!-- Live index stats badge -->
        <div class="inline-flex items-center gap-2 rounded-lg border border-[#242836] bg-[#13161d] px-3 py-2 text-xs">
          <div class="flex items-center gap-1.5 text-orange-400">
            <Package class="h-3.5 w-3.5" />
            <span class="font-mono font-semibold">{packageCount}</span>
            <span class="text-[#8891a8]">packages</span>
          </div>
          <span class="text-[#242836]">|</span>
          <div class="text-[#8891a8]" title={absoluteIndexed}>
            <span>Indexed:</span> <span class="text-[#e8eaf0]">{lastIndexed}</span>
          </div>
          {#if shortSha}
            <span class="text-[#242836]">|</span>
            <a
              href="https://github.com/aerynOS/recipes/commit/{packageStore.commitSha}"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 font-mono text-[11px] text-[#8891a8] hover:text-orange-400"
              title="Git Commit SHA"
            >
              <GitCommit class="h-3 w-3" />
              <span>{shortSha}</span>
            </a>
          {/if}
        </div>
      </div>
    </div>

    <!-- Bottom sub-bar with official links -->
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#242836]/60 pt-6">
      <div class="flex flex-wrap items-center gap-6">
        <a
          href="https://aerynos.com"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 transition hover:text-[#e8eaf0]"
        >
          <span>AerynOS Home</span>
          <ExternalLink class="h-3 w-3 opacity-60" />
        </a>
        <a
          href="https://aerynos.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 transition hover:text-[#e8eaf0]"
        >
          <span>Documentation</span>
          <ExternalLink class="h-3 w-3 opacity-60" />
        </a>
        <a
          href="https://dash.aerynos.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 transition hover:text-[#e8eaf0]"
        >
          <span>Summit Dashboard</span>
          <ExternalLink class="h-3 w-3 opacity-60" />
        </a>
        <a
          href="https://github.com/aerynOS"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 transition hover:text-[#e8eaf0]"
        >
          <span>GitHub Organization</span>
          <ExternalLink class="h-3 w-3 opacity-60" />
        </a>
      </div>

      <div class="flex items-center gap-1 text-[11px] text-[#8891a8]">
        <span>Unofficial community project for</span>
        <span class="text-orange-400 font-medium">AerynOS</span>
      </div>
    </div>
  </div>
</footer>
