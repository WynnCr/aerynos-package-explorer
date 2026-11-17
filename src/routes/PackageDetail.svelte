<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import { compareStore } from '$lib/stores/compare.svelte';
  import { installCommand, formatDomain, getBinaryPackages, getDefaultBinaryPackage } from '$lib/utils/format';
  import { copyToClipboard as writeToClipboard } from '$lib/utils/clipboard';
  import PackageCard from '$lib/components/package/PackageCard.svelte';
  import ChannelBadge from '$lib/components/package/ChannelBadge.svelte';

  let { params = { name: '' } }: { params?: { name: string } } = $props();

  let activeTab = $state<'overview' | 'dependencies' | 'subpackages' | 'build' | 'raw'>('overview');
  let copiedCommand = $state(false);
  let copiedHash = $state<string | null>(null);

  // Pure resolution: handles recipe name, subpackage name, or font- prefix alias without state mutations
  let resolved = $derived.by(() => {
    const raw = (params?.name || '').toLowerCase().trim();
    if (!raw) return { pkg: undefined, subpackage: null };

    // 1. Exact recipe name match
    let found = packageStore.packages.find(p => p.name.toLowerCase() === raw);
    if (found) {
      return { pkg: found, subpackage: null };
    }

    // 2. Direct subpackage match (e.g. font-jetbrains-mono-ttf -> font-jetbrains-mono)
    found = packageStore.packages.find(p => p.packages?.some(sub => sub.name.toLowerCase() === raw));
    if (found) {
      return { pkg: found, subpackage: raw };
    }

    // 3. Font prefix aliases: 'jetbrains-mono' -> 'font-jetbrains-mono'
    if (!raw.startsWith('font-')) {
      found = packageStore.packages.find(p => p.name.toLowerCase() === `font-${raw}`);
      if (found) {
        return { pkg: found, subpackage: null };
      }
    } else {
      found = packageStore.packages.find(p => p.name.toLowerCase() === raw.replace(/^font-/, ''));
      if (found) {
        return { pkg: found, subpackage: null };
      }
    }

    // 4. Fuzzy search across recipe names and subpackages
    const fuzzy = packageStore.packages.find(p =>
      p.name.toLowerCase().includes(raw) ||
      p.packages?.some(sub => sub.name.toLowerCase().includes(raw))
    );
    return { pkg: fuzzy, subpackage: null };
  });

  let pkg = $derived(resolved.pkg);
  let matchedSubpackage = $derived(resolved.subpackage);

  let binaryOptions = $derived(pkg ? getBinaryPackages(pkg) : []);
  let selectedBinary = $state<string>('');

  $effect(() => {
    if (pkg) {
      if (matchedSubpackage) {
        selectedBinary = matchedSubpackage;
      } else {
        selectedBinary = getDefaultBinaryPackage(pkg);
      }
    }
  });

  $effect(() => {
    if (params?.name) {
      window.scrollTo(0, 0);
    }
  });

  let isCompared = $derived(pkg ? compareStore.has(pkg.name) : false);

  // Similar packages in same category
  let relatedPackages = $derived(
    pkg
      ? packageStore.packages
          .filter(p => p.name !== pkg!.name && p.category === pkg!.category)
          .slice(0, 4)
      : []
  );

  async function copyInstall(binaryName?: string) {
    if (!pkg) return;
    const target = binaryName || selectedBinary || pkg.name;
    const cmd = installCommand(target);
    const success = await writeToClipboard(cmd);
    if (success) {
      copiedCommand = true;
      setTimeout(() => copiedCommand = false, 2000);
    }
  }

  async function copyToClipboard(text: string, id: string) {
    const success = await writeToClipboard(text);
    if (success) {
      copiedHash = id;
      setTimeout(() => copiedHash = null, 2000);
    }
  }

  function parseDep(dep: string): { raw: string; kind?: string; target: string; hasPackage: boolean } {
    const match = dep.match(/^(pkgconfig|pkgconfig32|binary|sysbinary|cmake|python)\((.+)\)$/);
    if (match) {
      const kind = match[1];
      const target = match[2];
      const hasPackage = packageStore.packages.some(p => p.name.toLowerCase() === target.toLowerCase());
      return { raw: dep, kind, target, hasPackage };
    }
    const hasPackage = packageStore.packages.some(p => p.name.toLowerCase() === dep.toLowerCase());
    return { raw: dep, target: dep, hasPackage };
  }

  // Synthesize YAML representation for raw view
  function generateRecipeYaml(p: typeof pkg): string {
    if (!p) return '';
    const lines: string[] = [];
    lines.push(`name        : ${p.name}`);
    lines.push(`version     : "${p.version}"`);
    lines.push(`release     : ${p.release}`);
    lines.push(`homepage    : ${p.homepage || ''}`);
    lines.push(`summary     : ${p.summary || ''}`);
    const desc = p.description || p.summary || '';
    if (desc) {
      lines.push(`description : |`);
      lines.push(`    ${desc.replace(/\n/g, '\n    ')}`);
    }
    
    if (p.license && p.license.length > 0) {
      lines.push(`license     :`);
      for (const lic of p.license) {
        lines.push(`    - ${lic}`);
      }
    }

    if (p.upstreams && p.upstreams.length > 0) {
      lines.push(`upstreams   :`);
      for (const u of p.upstreams) {
        lines.push(`    - ${u.url}${u.hash ? ' : ' + u.hash : ''}`);
      }
    }

    if (p.toolchain) {
      lines.push(`toolchain   : ${p.toolchain}`);
    }

    if (p.emul32) {
      lines.push(`emul32      : true`);
    }

    if (p.builddeps && p.builddeps.length > 0) {
      lines.push(`builddeps   :`);
      for (const b of p.builddeps) {
        lines.push(`    - ${b}`);
      }
    }

    if (p.rundeps && p.rundeps.length > 0) {
      lines.push(`rundeps     :`);
      for (const r of p.rundeps) {
        lines.push(`    - ${r}`);
      }
    }

    if (p.setup) {
      lines.push(`setup       : |`);
      lines.push(`    ${p.setup.replace(/\n/g, '\n    ')}`);
    }

    if (p.build) {
      lines.push(`build       : |`);
      lines.push(`    ${p.build.replace(/\n/g, '\n    ')}`);
    }

    if (p.install) {
      lines.push(`install     : |`);
      lines.push(`    ${p.install.replace(/\n/g, '\n    ')}`);
    }

    if (p.check) {
      lines.push(`check       : |`);
      lines.push(`    ${p.check.replace(/\n/g, '\n    ')}`);
    }

    if (p.environment) {
      lines.push(`environment : |`);
      lines.push(`    ${p.environment.replace(/\n/g, '\n    ')}`);
    }

    if (p.packages && p.packages.length > 0) {
      lines.push(`packages    :`);
      for (const sub of p.packages) {
        lines.push(`    - name        : ${sub.name}`);
        if (sub.summary) lines.push(`      summary     : ${sub.summary}`);
        if (sub.description) lines.push(`      description : ${sub.description}`);
        if (sub.paths && sub.paths.length > 0) {
          lines.push(`      paths       :`);
          for (const path of sub.paths) {
            lines.push(`        - ${path}`);
          }
        }
      }
    }

    return lines.join('\n');
  }
</script>

{#snippet tab(id: typeof activeTab, label: string, count?: number)}
  <button
    type="button"
    role="tab"
    aria-selected={activeTab === id}
    onclick={() => (activeTab = id)}
    class="shrink-0 border-b-2 px-1 pb-2 text-sm {activeTab === id ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'}"
  >
    {label}{#if count}<span class="text-muted">&nbsp;({count})</span>{/if}
  </button>
{/snippet}

{#snippet depList(deps: string[], showKind: boolean)}
  <ul class="divide-y divide-line border-y border-line">
    {#each deps as dep}
      {@const parsed = parseDep(dep)}
      <li class="flex items-baseline justify-between gap-3 py-1.5 font-mono text-sm">
        <span class="min-w-0 truncate">
          {#if showKind && parsed.kind}<span class="text-muted">{parsed.kind}:</span>{/if}
          {#if parsed.hasPackage}
            <a class="link" href="#/package/{parsed.target}">{parsed.target}</a>
          {:else}
            {parsed.target}
          {/if}
        </span>
        {#if parsed.hasPackage}<span class="shrink-0 font-sans text-xs text-muted">in index</span>{/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
  <p class="mb-6 text-sm"><a class="link" href="#/">← All packages</a></p>

  {#if packageStore.loading}
    <p class="py-12 text-muted">Loading the package index…</p>
  {:else if !pkg}
    <div class="py-12">
      <h1 class="text-xl font-semibold">No such package</h1>
      <p class="mt-2 text-muted">
        Nothing in the index matches <code>{params?.name}</code>. It may have been renamed or removed,
        or the index may be out of date.
      </p>
      <p class="mt-4"><a class="link" href="#/">Search all packages</a></p>
    </div>
  {:else}
    <header class="space-y-3">
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 class="font-mono text-2xl font-semibold">{pkg.name}</h1>
        <span
          class="font-mono text-muted"
          title="Version from stone.yaml on the main branch. The unstable stream may still ship an older one."
        >{pkg.version}-{pkg.release}</span>
        <ChannelBadge channel={pkg.channel} size="md" />
      </div>

      <p class="max-w-3xl text-lg">{pkg.summary}</p>

      <p class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        {#if pkg.category}<a class="hover:text-fg" href="#/categories/{encodeURIComponent(pkg.category)}">{pkg.category}</a>{/if}
        <span>{(pkg.license || []).join(', ') || 'license unknown'}</span>
        {#if pkg.toolchain && pkg.toolchain !== 'llvm'}<span>toolchain {pkg.toolchain}</span>{/if}
        {#if pkg.emul32}<span>emul32</span>{/if}
      </p>

      <p class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {#if pkg.homepage}
          <a class="link" href={pkg.homepage} target="_blank" rel="noopener noreferrer">{formatDomain(pkg.homepage)}</a>
        {/if}
        <a class="link" href={pkg.recipeUrl} target="_blank" rel="noopener noreferrer">stone.yaml on GitHub</a>
        <button type="button" class="act" aria-pressed={isCompared} onclick={() => compareStore.toggle(pkg)}>
          {isCompared ? 'remove from comparison' : 'add to comparison'}
        </button>
      </p>
    </header>

    <section class="mt-8 space-y-3">
      {#if pkg.channel === 'volatile'}
        <p class="border-l-2 border-warn pl-4">
          <strong class="font-medium text-warn">Volatile only.</strong>
          This recipe is in the newest snapshot (<code>stream/volatile</code>) but hasn't been promoted
          to <code>stream/unstable</code>, which is what systems follow by default, so you can't install
          it with moss on a normal setup yet.
        </p>
        {#if binaryOptions.length > 1}
          <p class="text-sm text-muted">
            It builds: {#each binaryOptions as bin, i}<code>{bin.name}</code>{i < binaryOptions.length - 1 ? ', ' : ''}{/each}
          </p>
        {/if}
      {:else if pkg.channel === 'recipe'}
        <p class="border-l-2 border-line pl-4 text-muted">
          Recipe only. It's in git, but no binary package has been built for it yet.
        </p>
      {:else}
        <div class="flex items-center justify-between gap-3 rounded border border-line bg-surface px-4 py-3">
          <code class="select-all !bg-transparent !p-0 text-base">sudo moss package add {selectedBinary || pkg.name}</code>
          <button type="button" class="act shrink-0" onclick={() => copyInstall(selectedBinary || pkg.name)}>
            {copiedCommand ? 'copied' : 'copy'}
          </button>
        </div>

        {#if binaryOptions.length > 1}
          <p class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted">
            This recipe builds several packages:
            {#each binaryOptions as bin}
              <button
                type="button"
                class="font-mono {selectedBinary === bin.name ? 'text-accent underline underline-offset-4' : 'hover:text-fg'}"
                title={bin.summary || bin.name}
                onclick={() => (selectedBinary = bin.name)}
              >{bin.name}</button>
            {/each}
          </p>
        {/if}

        <p class="text-sm text-muted">
          The version above comes from the recipe on <code>main</code>. The unstable stream may still ship an
          older build until maintainers tag and promote it.
        </p>
      {/if}
    </section>

    <div class="mt-10 flex gap-5 overflow-x-auto border-b border-line no-scrollbar" role="tablist">
      {@render tab('overview', 'Overview')}
      {@render tab('dependencies', 'Dependencies', (pkg.builddeps?.length || 0) + (pkg.rundeps?.length || 0))}
      {#if pkg.packages && pkg.packages.length > 0}
        {@render tab('subpackages', 'Subpackages', pkg.packages.length)}
      {/if}
      {#if pkg.setup || pkg.build || pkg.install || pkg.check || pkg.environment}
        {@render tab('build', 'Build steps')}
      {/if}
      {@render tab('raw', 'stone.yaml')}
    </div>

    <div class="mt-6">
      {#if activeTab === 'overview'}
        <div class="grid gap-10 lg:grid-cols-[1fr_16rem]">
          <div class="space-y-8">
            <section>
              <h2 class="mb-2 font-semibold">Description</h2>
              <p class="whitespace-pre-line">{pkg.description || pkg.summary}</p>
            </section>

            <section>
              <h2 class="mb-2 font-semibold">Upstream sources</h2>
              {#if pkg.upstreams && pkg.upstreams.length > 0}
                <ul class="space-y-3">
                  {#each pkg.upstreams as u, i}
                    <li class="text-sm">
                      <a class="link break-all font-mono" href={u.url} target="_blank" rel="noopener noreferrer">{u.url}</a>
                      <span class="text-muted">({u.type})</span>
                      {#if u.hash}
                        <div class="mt-1 flex items-baseline gap-3 font-mono text-xs text-muted">
                          <span class="break-all">sha256 {u.hash}</span>
                          <button type="button" class="act shrink-0 font-sans" onclick={() => copyToClipboard(u.hash, `hash-${i}`)}>
                            {copiedHash === `hash-${i}` ? 'copied' : 'copy'}
                          </button>
                        </div>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {:else}
                <p class="text-sm text-muted">No upstream sources recorded.</p>
              {/if}
            </section>
          </div>

          <dl class="h-fit divide-y divide-line self-start border-y border-line text-sm">
            {#each [
              ['Recipe', pkg.name],
              ['Version', pkg.version],
              ['Release', String(pkg.release)],
              ['Directory', `recipes/${pkg.letter}/${pkg.name}/`],
              ['Toolchain', pkg.toolchain || 'llvm'],
              ['emul32', pkg.emul32 ? 'yes' : 'no']
            ] as [k, v]}
              <div class="flex justify-between gap-3 py-1.5">
                <dt class="text-muted">{k}</dt>
                <dd class="break-all text-right font-mono">{v}</dd>
              </div>
            {/each}
          </dl>
        </div>
      {/if}

      {#if activeTab === 'dependencies'}
        <div class="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 class="mb-2 font-semibold">Build <span class="font-normal text-muted">({pkg.builddeps?.length || 0})</span></h2>
            {#if pkg.builddeps && pkg.builddeps.length > 0}
              {@render depList(pkg.builddeps, true)}
            {:else}
              <p class="text-sm text-muted">None listed.</p>
            {/if}
          </section>

          <section>
            <h2 class="mb-2 font-semibold">Runtime <span class="font-normal text-muted">({pkg.rundeps?.length || 0})</span></h2>
            {#if pkg.rundeps && pkg.rundeps.length > 0}
              {@render depList(pkg.rundeps, false)}
            {:else}
              <p class="text-sm text-muted">
                None listed in the recipe. moss works out library dependencies from the built binaries.
              </p>
            {/if}
          </section>
        </div>
      {/if}

      {#if activeTab === 'subpackages' && pkg.packages && pkg.packages.length > 0}
        <ul class="divide-y divide-line border-y border-line">
          {#each pkg.packages as sub}
            <li class="py-3">
              <div class="flex items-baseline justify-between gap-3">
                <span class="font-mono font-medium">{sub.name}</span>
                {#if pkg.channel === 'volatile' || sub.channel === 'volatile'}
                  <span class="text-sm text-warn">volatile only</span>
                {:else}
                  <button type="button" class="act" onclick={() => copyToClipboard(`sudo moss package add ${sub.name}`, sub.name)}>
                    {copiedHash === sub.name ? 'copied' : 'copy command'}
                  </button>
                {/if}
              </div>
              {#if sub.summary}<p class="text-sm text-muted">{sub.summary}</p>{/if}
              {#if sub.paths && sub.paths.length > 0}
                <p class="mt-2 break-all font-mono text-xs text-muted">{sub.paths.join('   ')}</p>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}

      {#if activeTab === 'build'}
        <div class="space-y-6">
          {#each [['environment', pkg.environment], ['setup', pkg.setup], ['build', pkg.build], ['install', pkg.install], ['check', pkg.check]] as [label, body]}
            {#if body}
              <section>
                <h2 class="mb-1 font-mono text-sm text-muted">{label}</h2>
                <pre><code>{body}</code></pre>
              </section>
            {/if}
          {/each}
        </div>
      {/if}

      {#if activeTab === 'raw'}
        <div class="space-y-3">
          <p class="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm text-muted">
            Rebuilt from the index, so formatting and comments differ from the file in git.
            <button type="button" class="act" onclick={() => copyToClipboard(generateRecipeYaml(pkg), 'yaml')}>
              {copiedHash === 'yaml' ? 'copied' : 'copy'}
            </button>
            <a class="link" href={pkg.recipeUrl} target="_blank" rel="noopener noreferrer">original on GitHub</a>
          </p>
          <pre><code>{generateRecipeYaml(pkg)}</code></pre>
        </div>
      {/if}
    </div>

    {#if relatedPackages.length > 0}
      <section class="mt-12">
        <div class="flex items-baseline justify-between">
          <h2 class="font-semibold">More in {pkg.category}</h2>
          <a class="link text-sm" href="#/categories/{encodeURIComponent(pkg.category || 'Other')}">all {pkg.category}</a>
        </div>
        <div class="mt-2 border-t border-line">
          {#each relatedPackages as related}
            <PackageCard pkg={related} compact={true} />
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</div>
