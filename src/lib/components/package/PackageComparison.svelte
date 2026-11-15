<script lang="ts">
  import { compareStore } from '$lib/stores/compare.svelte';
  import { installCommand, formatDomain } from '$lib/utils/format';
  import { copyToClipboard } from '$lib/utils/clipboard';
  import ChannelBadge from './ChannelBadge.svelte';

  let copied = $state<string | null>(null);

  async function copyCommand(name: string) {
    if (await copyToClipboard(installCommand(name))) {
      copied = name;
      setTimeout(() => { if (copied === name) copied = null; }, 2000);
    }
  }

  let packages = $derived(compareStore.items);

  const cell = 'border-b border-line px-3 py-3 align-top';
  const label = `${cell} w-36 text-sm text-muted`;
</script>

{#if packages.length === 0}
  <div class="border-t border-line py-10">
    <p>Nothing to compare yet.</p>
    <p class="mt-1 text-sm text-muted">
      Use the box above, or click “compare” next to a package in the <a class="link" href="#/">list</a>.
    </p>
  </div>
{:else}
  <div class="mb-3 flex items-baseline justify-between text-sm">
    <span class="text-muted">{packages.length} of 4</span>
    <button type="button" class="act" onclick={() => compareStore.clear()}>clear all</button>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left">
      <thead>
        <tr>
          <th class="{cell} w-36"></th>
          {#each packages as pkg}
            <th class="{cell} min-w-52 max-w-72 font-normal">
              <a class="font-mono font-medium hover:text-accent" href="#/package/{pkg.name}">{pkg.name}</a>
              <span class="ml-1 font-mono text-sm text-muted">{pkg.version}-{pkg.release}</span>
              <div>
                <button type="button" class="act" onclick={() => compareStore.remove(pkg.name)}>remove</button>
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th class="{label} font-normal" scope="row">Stream</th>
          {#each packages as pkg}<td class={cell}><ChannelBadge channel={pkg.channel} size="md" /></td>{/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Install</th>
          {#each packages as pkg}
            <td class={cell}>
              {#if pkg.channel === 'volatile'}
                <span class="text-sm text-warn">not in unstable yet</span>
              {:else}
                <button type="button" class="act text-left font-mono" onclick={() => copyCommand(pkg.name)} title="Copy">
                  {copied === pkg.name ? 'copied' : `moss package add ${pkg.name}`}
                </button>
              {/if}
            </td>
          {/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Summary</th>
          {#each packages as pkg}<td class={cell}>{pkg.summary || pkg.description || '—'}</td>{/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Category</th>
          {#each packages as pkg}<td class={cell}>{pkg.category || 'Other'}</td>{/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">License</th>
          {#each packages as pkg}
            <td class="{cell} font-mono text-sm">{pkg.license?.length ? pkg.license.join(', ') : 'unspecified'}</td>
          {/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Homepage</th>
          {#each packages as pkg}
            <td class={cell}>
              {#if pkg.homepage}
                <a class="link" href={pkg.homepage} target="_blank" rel="noopener noreferrer">{formatDomain(pkg.homepage)}</a>
              {:else}—{/if}
            </td>
          {/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Toolchain</th>
          {#each packages as pkg}<td class="{cell} font-mono text-sm">{pkg.toolchain || 'llvm'}</td>{/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">emul32</th>
          {#each packages as pkg}<td class={cell}>{pkg.emul32 ? 'yes' : 'no'}</td>{/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Build deps</th>
          {#each packages as pkg}
            <td class={cell}>
              {#if pkg.builddeps?.length}
                <div>{pkg.builddeps.length}</div>
                <p class="mt-1 max-h-40 overflow-y-auto break-words font-mono text-xs text-muted">{pkg.builddeps.join('  ')}</p>
              {:else}none listed{/if}
            </td>
          {/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Runtime deps</th>
          {#each packages as pkg}
            <td class={cell}>
              {#if pkg.rundeps?.length}
                <div>{pkg.rundeps.length}</div>
                <p class="mt-1 break-words font-mono text-xs text-muted">{pkg.rundeps.join('  ')}</p>
              {:else}none listed{/if}
            </td>
          {/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Binary packages</th>
          {#each packages as pkg}
            <td class="{cell} font-mono text-sm">
              {#if pkg.packages?.length}
                {#each pkg.packages as sub}<div>{sub.name}</div>{/each}
              {:else}<span class="font-sans text-muted">single package</span>{/if}
            </td>
          {/each}
        </tr>
        <tr>
          <th class="{label} font-normal" scope="row">Recipe</th>
          {#each packages as pkg}
            <td class={cell}>
              <a class="link font-mono text-sm" href={pkg.recipeUrl} target="_blank" rel="noopener noreferrer">recipes/{pkg.letter}/{pkg.name}</a>
            </td>
          {/each}
        </tr>
      </tbody>
    </table>
  </div>
{/if}
