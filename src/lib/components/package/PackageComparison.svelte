<script lang="ts">
  import type { Package } from '$lib/data/types';
  import { compareStore } from '$lib/stores/compare.svelte';
  import { installCommand, formatDomain } from '$lib/utils/format';
  import { copyToClipboard } from '$lib/utils/clipboard';
  import ChannelBadge from './ChannelBadge.svelte';
  import { X, Copy, Check, ExternalLink, Trash2, Box, Layers, Terminal } from 'lucide-svelte';

  let copiedStates = $state<Record<string, boolean>>({});

  async function copyCommand(pkgName: string) {
    const cmd = installCommand(pkgName);
    const success = await copyToClipboard(cmd);
    if (success) {
      copiedStates = { ...copiedStates, [pkgName]: true };
      setTimeout(() => {
        copiedStates = { ...copiedStates, [pkgName]: false };
      }, 2000);
    }
  }

  let packages = $derived(compareStore.items);
</script>

<div class="space-y-6">
  <!-- Comparison Toolbar -->
  <div class="flex items-center justify-between border-b border-[#242836] pb-4">
    <div>
      <h2 class="text-lg font-bold text-[#e8eaf0]">
        Comparing <span class="text-orange-400 font-mono">{packages.length}</span> {packages.length === 1 ? 'Package' : 'Packages'}
      </h2>
      <p class="text-xs text-[#8891a8]">Compare recipe attributes, dependencies, subpackages, and toolchains side-by-side.</p>
    </div>

    {#if packages.length > 0}
      <button
        type="button"
        onclick={() => compareStore.clear()}
        class="inline-flex items-center gap-1.5 rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5 text-xs text-[#8891a8] hover:border-red-500/40 hover:text-red-400 transition"
      >
        <Trash2 class="h-3.5 w-3.5" />
        <span>Clear comparison</span>
      </button>
    {/if}
  </div>

  {#if packages.length === 0}
    <div class="rounded-xl border border-[#242836] bg-[#13161d] p-12 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1e28] text-[#8891a8] border border-[#242836]">
        <Box class="h-6 w-6" />
      </div>
      <h3 class="mt-4 text-base font-semibold text-[#e8eaf0]">No packages selected</h3>
      <p class="mt-1 text-xs text-[#8891a8] max-w-sm mx-auto">
        Browse or search packages and click the <strong class="text-[#e8eaf0]">Compare</strong> button to add up to 4 packages to this matrix.
      </p>
      <a
        href="#/"
        class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-black hover:bg-orange-400 transition"
      >
        Browse packages
      </a>
    </div>
  {:else}
    <!-- Scrollable comparison matrix table -->
    <div class="overflow-x-auto rounded-xl border border-[#242836] bg-[#13161d] shadow-lg">
      <table class="w-full border-collapse text-left text-xs">
        <thead>
          <tr class="border-b border-[#242836] bg-[#1a1e28]/50">
            <th class="w-44 p-4 font-semibold text-[#8891a8] uppercase tracking-wider text-[11px] shrink-0">
              Attribute
            </th>
            {#each packages as pkg}
              <th class="min-w-64 p-4 align-top">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <a
                      href="#/package/{pkg.name}"
                      class="text-base font-bold text-[#e8eaf0] hover:text-orange-400 transition"
                    >
                      {pkg.name}
                    </a>
                    <div class="mt-1 text-xs font-mono text-[#8891a8]" title="Recipe version defined in stone.yaml">
                      v{pkg.version}-{pkg.release}
                    </div>
                  </div>

                  <button
                    type="button"
                    onclick={() => compareStore.remove(pkg.name)}
                    class="rounded p-1 text-[#8891a8] hover:bg-[#242836] hover:text-red-400 transition"
                    title="Remove {pkg.name}"
                    aria-label="Remove from comparison"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </th>
            {/each}
          </tr>
        </thead>

        <tbody class="divide-y divide-[#242836]/60">
          <!-- Repository Stream -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Repository Stream</td>
            {#each packages as pkg}
              <td class="p-4">
                <ChannelBadge channel={pkg.channel} size="sm" />
              </td>
            {/each}
          </tr>

          <!-- Install Command -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Installation</td>
            {#each packages as pkg}
              <td class="p-4">
                {#if pkg.channel === 'volatile'}
                  <div class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 font-mono text-xs text-amber-300 flex items-center justify-between">
                    <span>In volatile stream only</span>
                    <span class="text-[10px] uppercase font-semibold text-amber-400">Not in unstable</span>
                  </div>
                {:else}
                  <button
                    type="button"
                    onclick={() => copyCommand(pkg.name)}
                    class="flex w-full items-center justify-between rounded-lg border border-[#242836] bg-[#0d0f14] px-2.5 py-1.5 font-mono text-xs text-[#e8eaf0] hover:border-orange-500/50 transition group"
                  >
                    <span class="truncate">sudo moss package add {pkg.name}</span>
                    {#if copiedStates[pkg.name]}
                      <Check class="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-2" />
                    {:else}
                      <Copy class="h-3.5 w-3.5 text-[#8891a8] group-hover:text-orange-400 shrink-0 ml-2" />
                    {/if}
                  </button>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Summary -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Summary</td>
            {#each packages as pkg}
              <td class="p-4 text-[#e8eaf0] leading-relaxed">
                {pkg.summary || pkg.description || '—'}
              </td>
            {/each}
          </tr>

          <!-- Category -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Category</td>
            {#each packages as pkg}
              <td class="p-4">
                {#if pkg.category}
                  <span class="rounded bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400 border border-orange-500/20">
                    {pkg.category}
                  </span>
                {:else}
                  <span class="text-[#8891a8]">Other</span>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- License -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">License</td>
            {#each packages as pkg}
              <td class="p-4">
                <div class="flex flex-wrap gap-1">
                  {#if pkg.license && pkg.license.length > 0}
                    {#each pkg.license as lic}
                      <span class="rounded bg-[#1a1e28] px-2 py-0.5 font-mono text-[11px] text-[#e8eaf0] border border-[#242836]">
                        {lic}
                      </span>
                    {/each}
                  {:else}
                    <span class="text-[#8891a8]">Unspecified</span>
                  {/if}
                </div>
              </td>
            {/each}
          </tr>

          <!-- Homepage & Upstream Source -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Homepage</td>
            {#each packages as pkg}
              <td class="p-4">
                {#if pkg.homepage}
                  <a
                    href={pkg.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-orange-400 hover:underline max-w-[200px] truncate"
                  >
                    <span>{formatDomain(pkg.homepage)}</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else}
                  <span class="text-[#8891a8]">None</span>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Toolchain -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Toolchain</td>
            {#each packages as pkg}
              <td class="p-4">
                <span class="font-mono {pkg.toolchain === 'gnu' ? 'text-amber-400 font-semibold' : 'text-[#8891a8]'}">
                  {pkg.toolchain || 'llvm (default)'}
                </span>
              </td>
            {/each}
          </tr>

          <!-- 32-bit Emulation (emul32) -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Emul32 Support</td>
            {#each packages as pkg}
              <td class="p-4">
                {#if pkg.emul32}
                  <span class="rounded bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/30">
                    Yes (32-bit build enabled)
                  </span>
                {:else}
                  <span class="text-[#8891a8]">No</span>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Build Dependencies -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">
              <div>Build Dependencies</div>
              <div class="text-[10px] text-[#8891a8]/70">builddeps in stone.yaml</div>
            </td>
            {#each packages as pkg}
              <td class="p-4">
                {#if pkg.builddeps && pkg.builddeps.length > 0}
                  <div class="font-semibold text-[#e8eaf0] mb-1.5">
                    {pkg.builddeps.length} total
                  </div>
                  <div class="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                    {#each pkg.builddeps as dep}
                      <span class="rounded bg-[#0d0f14] px-1.5 py-0.5 font-mono text-[10px] text-[#8891a8] border border-[#242836]">
                        {dep}
                      </span>
                    {/each}
                  </div>
                {:else}
                  <span class="text-[#8891a8]">None / Base system</span>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Runtime Dependencies -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Runtime Dependencies</td>
            {#each packages as pkg}
              <td class="p-4">
                {#if pkg.rundeps && pkg.rundeps.length > 0}
                  <div class="font-semibold text-[#e8eaf0] mb-1.5">
                    {pkg.rundeps.length} total
                  </div>
                  <div class="flex flex-wrap gap-1">
                    {#each pkg.rundeps as dep}
                      <span class="rounded bg-[#0d0f14] px-1.5 py-0.5 font-mono text-[10px] text-orange-300 border border-orange-500/20">
                        {dep}
                      </span>
                    {/each}
                  </div>
                {:else}
                  <span class="text-[#8891a8]">Default shared lib resolution</span>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Subpackages -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Subpackages</td>
            {#each packages as pkg}
              <td class="p-4">
                {#if pkg.packages && pkg.packages.length > 0}
                  <div class="space-y-1">
                    {#each pkg.packages as sub}
                      <div class="rounded bg-[#0d0f14] p-1.5 border border-[#242836]">
                        <div class="font-mono text-[11px] font-semibold text-orange-400">{sub.name}</div>
                        {#if sub.summary}
                          <div class="text-[10px] text-[#8891a8] truncate">{sub.summary}</div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <span class="text-[#8891a8]">Standard single package</span>
                {/if}
              </td>
            {/each}
          </tr>

          <!-- Recipe link -->
          <tr class="hover:bg-[#1a1e28]/20">
            <td class="p-4 font-medium text-[#8891a8]">Source Recipe</td>
            {#each packages as pkg}
              <td class="p-4">
                <a
                  href={pkg.recipeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 font-mono text-[11px] text-[#8891a8] hover:text-orange-400"
                >
                  <span>recipes/{pkg.letter}/{pkg.name}/stone.yaml</span>
                  <ExternalLink class="h-3 w-3" />
                </a>
              </td>
            {/each}
          </tr>
        </tbody>
      </table>
    </div>
  {/if}
</div>
