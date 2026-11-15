<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import { compareStore } from '$lib/stores/compare.svelte';
  import { installCommand, formatDomain, getBinaryPackages, getDefaultBinaryPackage } from '$lib/utils/format';
  import { copyToClipboard as writeToClipboard } from '$lib/utils/clipboard';
  import PackageCard from '$lib/components/package/PackageCard.svelte';
  import {
    ArrowLeft,
    Copy,
    Check,
    Scale,
    ExternalLink,
    Terminal,
    Layers,
    Box,
    FileText,
    Cpu,
    GitBranch,
    Shield,
    FolderGit2,
    Code2,
    AlertCircle,
    Package as PackageIcon
  } from 'lucide-svelte';

  let { params = { name: '' } }: { params?: { name: string } } = $props();

  let activeTab = $state<'overview' | 'dependencies' | 'subpackages' | 'build' | 'raw'>('overview');
  let copiedCommand = $state(false);
  let copiedHash = $state<string | null>(null);
  let matchedSubpackage = $state<string | null>(null);

  // Robust package resolution: handles recipe name, subpackage name, or font- prefix alias
  let pkg = $derived.by(() => {
    const raw = (params?.name || '').toLowerCase().trim();
    if (!raw) return undefined;

    // 1. Exact recipe name match
    let found = packageStore.packages.find(p => p.name.toLowerCase() === raw);
    if (found) {
      matchedSubpackage = null;
      return found;
    }

    // 2. Direct subpackage match (e.g. font-jetbrains-mono-ttf -> font-jetbrains-mono)
    found = packageStore.packages.find(p => p.packages?.some(sub => sub.name.toLowerCase() === raw));
    if (found) {
      matchedSubpackage = raw;
      return found;
    }

    // 3. Font prefix aliases: 'jetbrains-mono' -> 'font-jetbrains-mono'
    if (!raw.startsWith('font-')) {
      found = packageStore.packages.find(p => p.name.toLowerCase() === `font-${raw}`);
      if (found) {
        matchedSubpackage = null;
        return found;
      }
    } else {
      found = packageStore.packages.find(p => p.name.toLowerCase() === raw.replace(/^font-/, ''));
      if (found) {
        matchedSubpackage = null;
        return found;
      }
    }

    // 4. Fuzzy search across recipe names and subpackages
    return packageStore.packages.find(p =>
      p.name.toLowerCase().includes(raw) ||
      p.packages?.some(sub => sub.name.toLowerCase().includes(raw))
    );
  });

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
    lines.push(`homepage    : ${p.homepage}`);
    lines.push(`summary     : ${p.summary}`);
    lines.push(`description : |`);
    lines.push(`    ${p.description.replace(/\n/g, '\n    ')}`);
    
    if (p.license && p.license.length > 0) {
      lines.push(`license     :`);
      for (const lic of p.license) {
        lines.push(`    - ${lic}`);
      }
    }

    if (p.upstreams && p.upstreams.length > 0) {
      lines.push(`upstreams   :`);
      for (const u of p.upstreams) {
        lines.push(`    - ${u.url} : ${u.hash}`);
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

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <!-- Back navigation button -->
  <div class="mb-6">
    <a
      href="#/"
      class="inline-flex items-center gap-2 rounded-lg border border-[#242836] bg-[#13161d] px-3 py-1.5 text-xs font-medium text-[#8891a8] hover:border-orange-500/50 hover:text-[#e8eaf0] transition"
    >
      <ArrowLeft class="h-3.5 w-3.5" />
      <span>Back to packages</span>
    </a>
  </div>

  {#if packageStore.loading}
    <div class="rounded-xl border border-[#242836] bg-[#13161d] p-16 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
      <p class="mt-4 text-sm text-[#8891a8]">Loading package details...</p>
    </div>
  {:else if !pkg}
    <div class="rounded-xl border border-[#242836] bg-[#13161d] p-16 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1e28] text-orange-400 border border-[#242836]">
        <AlertCircle class="h-6 w-6" />
      </div>
      <h2 class="mt-4 text-xl font-bold text-[#e8eaf0]">Package Not Found</h2>
      <p class="mt-2 text-sm text-[#8891a8] max-w-md mx-auto">
        No package matching <span class="font-mono text-orange-400 font-semibold">{params?.name}</span> was found in the AerynOS recipe index.
      </p>
      <a
        href="#/"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-black hover:bg-orange-400 transition"
      >
        <span>Explore All Packages</span>
      </a>
    </div>
  {:else}
    <!-- Main Package Content -->
    <div class="space-y-8">
      <!-- Package Header Banner -->
      <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-6 sm:p-8 shadow-xl">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#e8eaf0]">
                {pkg.name}
              </h1>

              <span class="rounded-md bg-[#1a1e28] px-2.5 py-1 font-mono text-xs font-semibold text-orange-400 border border-[#242836]">
                v{pkg.version}-{pkg.release}
              </span>

              {#if pkg.category}
                <a
                  href="#/categories/{encodeURIComponent(pkg.category)}"
                  class="rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition"
                >
                  {pkg.category}
                </a>
              {/if}

              {#if pkg.license && pkg.license.length > 0}
                <div class="flex flex-wrap gap-1">
                  {#each pkg.license as lic}
                    <span class="rounded bg-[#1a1e28] px-2 py-0.5 text-xs text-[#8891a8] border border-[#242836]">
                      {lic}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>

            <p class="text-sm sm:text-base text-[#8891a8] max-w-3xl leading-relaxed">
              {pkg.summary}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-xs text-[#8891a8] pt-1">
              {#if pkg.homepage}
                <a
                  href={pkg.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 text-orange-400 hover:underline"
                >
                  <ExternalLink class="h-3.5 w-3.5" />
                  <span>{formatDomain(pkg.homepage)}</span>
                </a>
              {/if}

              <a
                href={pkg.recipeUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1.5 hover:text-[#e8eaf0] transition"
              >
                <FolderGit2 class="h-3.5 w-3.5" />
                <span class="font-mono">recipes/{pkg.letter}/{pkg.name}/stone.yaml</span>
              </a>

              {#if pkg.toolchain && pkg.toolchain !== 'llvm'}
                <span class="flex items-center gap-1 text-amber-400 font-mono">
                  <Cpu class="h-3.5 w-3.5" />
                  <span>toolchain: {pkg.toolchain}</span>
                </span>
              {/if}

              {#if pkg.emul32}
                <span class="rounded bg-purple-500/15 px-2 py-0.5 font-mono text-[11px] text-purple-300 border border-purple-500/30">
                  emul32 (32-bit enabled)
                </span>
              {/if}
            </div>
          </div>

          <!-- Quick Actions Panel -->
          <div class="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onclick={() => compareStore.toggle(pkg)}
              class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition {isCompared ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'border-[#242836] bg-[#1a1e28] text-[#8891a8] hover:text-[#e8eaf0] hover:border-[#8891a8]/40'}"
            >
              <Scale class="h-4 w-4" />
              <span>{isCompared ? 'In Compare List' : 'Add to Compare'}</span>
            </button>

            <a
              href={pkg.recipeUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 rounded-lg border border-[#242836] bg-[#1a1e28] px-4 py-2 text-xs font-medium text-[#8891a8] hover:text-[#e8eaf0] hover:border-[#8891a8]/40 transition"
            >
              <GitBranch class="h-4 w-4" />
              <span>View stone.yaml</span>
            </a>
          </div>
        </div>

        <!-- Prominent Install Command Banner -->
        <div class="mt-6 rounded-xl border border-[#242836] bg-[#0d0f14] p-5">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                  <Terminal class="h-5 w-5" />
                </div>
                <div>
                  <div class="text-[11px] uppercase tracking-wider text-[#8891a8] font-semibold flex items-center gap-2">
                    <span>Install transactional package via moss</span>
                    {#if binaryOptions.length > 1}
                      <span class="rounded bg-orange-500/15 px-1.5 py-0.2 text-[10px] text-orange-400 border border-orange-500/30 font-mono">
                        {binaryOptions.length} packages in recipe
                      </span>
                    {/if}
                  </div>
                  <div class="font-mono text-sm sm:text-base text-[#e8eaf0] mt-0.5 select-all font-medium">
                    sudo moss package add {selectedBinary || pkg.name}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onclick={() => copyInstall(selectedBinary || pkg.name)}
                class="flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-black hover:bg-orange-400 active:scale-95 transition shrink-0 shadow-sm"
              >
                {#if copiedCommand}
                  <Check class="h-4 w-4" />
                  <span>Copied!</span>
                {:else}
                  <Copy class="h-4 w-4" />
                  <span>Copy Install Command</span>
                {/if}
              </button>
            </div>

            <!-- If recipe produces multiple packages (e.g. font subpackages or -devel/-libs), show pill selector -->
            {#if binaryOptions.length > 1}
              <div class="pt-3 border-t border-[#242836]/60 flex flex-wrap items-center gap-2">
                <span class="text-xs text-[#8891a8] font-medium flex items-center gap-1">
                  <PackageIcon class="h-3.5 w-3.5 text-orange-400" />
                  <span>Select package to install:</span>
                </span>
                {#each binaryOptions as bin}
                  <button
                    type="button"
                    onclick={() => { selectedBinary = bin.name; copyInstall(bin.name); }}
                    class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition {selectedBinary === bin.name ? 'bg-orange-500/25 text-orange-300 border border-orange-500/50 shadow-sm font-semibold' : 'bg-[#1a1e28] text-[#8891a8] hover:text-[#e8eaf0] border border-[#242836]'}"
                    title={bin.summary || bin.name}
                  >
                    <span>{bin.name}</span>
                    {#if bin.isDefault}
                      <span class="text-[9px] uppercase px-1 rounded bg-orange-500/30 text-orange-200">default</span>
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-[#242836] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onclick={() => activeTab = 'overview'}
          class="flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-medium transition-colors shrink-0 {activeTab === 'overview' ? 'border-orange-500 text-orange-400' : 'border-transparent text-[#8891a8] hover:text-[#e8eaf0]'}"
        >
          <FileText class="h-4 w-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onclick={() => activeTab = 'dependencies'}
          class="flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-medium transition-colors shrink-0 {activeTab === 'dependencies' ? 'border-orange-500 text-orange-400' : 'border-transparent text-[#8891a8] hover:text-[#e8eaf0]'}"
        >
          <Box class="h-4 w-4" />
          <span>Dependencies</span>
          {#if (pkg.builddeps?.length || 0) + (pkg.rundeps?.length || 0) > 0}
            <span class="rounded bg-[#1a1e28] px-1.5 py-0.2 text-[10px] font-mono text-[#8891a8]">
              {(pkg.builddeps?.length || 0) + (pkg.rundeps?.length || 0)}
            </span>
          {/if}
        </button>

        {#if pkg.packages && pkg.packages.length > 0}
          <button
            type="button"
            onclick={() => activeTab = 'subpackages'}
            class="flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-medium transition-colors shrink-0 {activeTab === 'subpackages' ? 'border-orange-500 text-orange-400' : 'border-transparent text-[#8891a8] hover:text-[#e8eaf0]'}"
          >
            <Layers class="h-4 w-4" />
            <span>Subpackages</span>
            <span class="rounded bg-[#1a1e28] px-1.5 py-0.2 text-[10px] font-mono text-[#8891a8]">
              {pkg.packages.length}
            </span>
          </button>
        {/if}

        {#if pkg.setup || pkg.build || pkg.install || pkg.check || pkg.environment}
          <button
            type="button"
            onclick={() => activeTab = 'build'}
            class="flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-medium transition-colors shrink-0 {activeTab === 'build' ? 'border-orange-500 text-orange-400' : 'border-transparent text-[#8891a8] hover:text-[#e8eaf0]'}"
          >
            <Code2 class="h-4 w-4" />
            <span>Build Phases</span>
          </button>
        {/if}

        <button
          type="button"
          onclick={() => activeTab = 'raw'}
          class="flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-medium transition-colors shrink-0 {activeTab === 'raw' ? 'border-orange-500 text-orange-400' : 'border-transparent text-[#8891a8] hover:text-[#e8eaf0]'}"
        >
          <FolderGit2 class="h-4 w-4" />
          <span>Raw Recipe (stone.yaml)</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="space-y-6">
        <!-- 1. OVERVIEW TAB -->
        {#if activeTab === 'overview'}
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- Left 2 Cols: Description & Upstreams -->
            <div class="space-y-6 lg:col-span-2">
              <div class="rounded-xl border border-[#242836] bg-[#13161d] p-6">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-[#8891a8] mb-3">
                  About this package
                </h3>
                <p class="whitespace-pre-line text-sm leading-relaxed text-[#e8eaf0]">
                  {pkg.description || pkg.summary}
                </p>
              </div>

              <!-- Upstream Downloads & Checksums -->
              <div class="rounded-xl border border-[#242836] bg-[#13161d] p-6">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-[#8891a8] mb-3">
                  Upstream Sources & Verification
                </h3>

                {#if pkg.upstreams && pkg.upstreams.length > 0}
                  <div class="space-y-3">
                    {#each pkg.upstreams as u, i}
                      <div class="rounded-lg border border-[#242836] bg-[#0d0f14] p-3 text-xs">
                        <div class="flex items-center justify-between gap-2">
                          <a
                            href={u.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="font-mono text-orange-400 hover:underline truncate"
                          >
                            {u.url}
                          </a>
                          <span class="rounded bg-[#1a1e28] px-1.5 py-0.5 text-[10px] text-[#8891a8] uppercase border border-[#242836] shrink-0">
                            {u.type}
                          </span>
                        </div>

                        {#if u.hash}
                          <div class="mt-2 flex items-center justify-between gap-2 border-t border-[#242836]/60 pt-2 font-mono text-[11px] text-[#8891a8]">
                            <span class="truncate">SHA256: {u.hash}</span>
                            <button
                              type="button"
                              onclick={() => copyToClipboard(u.hash, `hash-${i}`)}
                              class="rounded p-1 hover:text-white transition shrink-0"
                              title="Copy SHA256 checksum"
                            >
                              {#if copiedHash === `hash-${i}`}
                                <Check class="h-3.5 w-3.5 text-emerald-400" />
                              {:else}
                                <Copy class="h-3.5 w-3.5" />
                              {/if}
                            </button>
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="text-xs text-[#8891a8]">No explicit upstream sources recorded.</p>
                {/if}
              </div>
            </div>

            <!-- Right 1 Col: Metadata Card -->
            <div class="space-y-6">
              <div class="rounded-xl border border-[#242836] bg-[#13161d] p-6 space-y-4 text-xs">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-[#8891a8]">
                  Package Metadata
                </h3>

                <div class="space-y-3 divide-y divide-[#242836]/60">
                  <div class="flex justify-between pt-2">
                    <span class="text-[#8891a8]">Name</span>
                    <span class="font-mono font-semibold text-[#e8eaf0]">{pkg.name}</span>
                  </div>

                  <div class="flex justify-between pt-2">
                    <span class="text-[#8891a8]">Version</span>
                    <span class="font-mono text-[#e8eaf0]">{pkg.version}</span>
                  </div>

                  <div class="flex justify-between pt-2">
                    <span class="text-[#8891a8]">Release</span>
                    <span class="font-mono text-[#e8eaf0]">{pkg.release}</span>
                  </div>

                  <div class="flex justify-between pt-2">
                    <span class="text-[#8891a8]">Directory Shard</span>
                    <span class="font-mono text-orange-400">recipes/{pkg.letter}/</span>
                  </div>

                  <div class="flex justify-between pt-2">
                    <span class="text-[#8891a8]">Toolchain</span>
                    <span class="font-mono text-[#e8eaf0]">{pkg.toolchain || 'llvm'}</span>
                  </div>

                  <div class="flex justify-between pt-2">
                    <span class="text-[#8891a8]">Emul32</span>
                    <span class="font-mono text-[#e8eaf0]">{pkg.emul32 ? 'Supported' : 'No'}</span>
                  </div>

                  <div class="flex justify-between pt-2">
                    <span class="text-[#8891a8]">Indexed At</span>
                    <span class="text-[#8891a8]">{pkg.indexedAt ? new Date(pkg.indexedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- 2. DEPENDENCIES TAB -->
        {#if activeTab === 'dependencies'}
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Build Dependencies -->
            <div class="rounded-xl border border-[#242836] bg-[#13161d] p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-[#8891a8]">
                  Build Dependencies (builddeps)
                </h3>
                <span class="rounded bg-[#1a1e28] px-2 py-0.5 font-mono text-xs text-orange-400 border border-[#242836]">
                  {pkg.builddeps?.length || 0}
                </span>
              </div>

              {#if pkg.builddeps && pkg.builddeps.length > 0}
                <div class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {#each pkg.builddeps as dep}
                    {@const parsed = parseDep(dep)}
                    <div class="flex items-center justify-between rounded-lg border border-[#242836] bg-[#0d0f14] px-3 py-2 text-xs">
                      <div class="flex items-center gap-2 min-w-0">
                        {#if parsed.kind}
                          <span class="rounded bg-sky-500/15 px-1.5 py-0.5 font-mono text-[10px] text-sky-400 border border-sky-500/30 shrink-0">
                            {parsed.kind}
                          </span>
                        {/if}

                        {#if parsed.hasPackage}
                          <a
                            href="#/package/{parsed.target}"
                            class="font-mono font-medium text-orange-400 hover:underline truncate"
                          >
                            {parsed.target}
                          </a>
                        {:else}
                          <span class="font-mono text-[#e8eaf0] truncate">{parsed.target}</span>
                        {/if}
                      </div>

                      {#if parsed.hasPackage}
                        <span class="text-[10px] text-[#8891a8] shrink-0 ml-2">In repo</span>
                      {/if}
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-xs text-[#8891a8]">No explicit build dependencies recorded.</p>
              {/if}
            </div>

            <!-- Runtime Dependencies -->
            <div class="rounded-xl border border-[#242836] bg-[#13161d] p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-[#8891a8]">
                  Runtime Dependencies (rundeps)
                </h3>
                <span class="rounded bg-[#1a1e28] px-2 py-0.5 font-mono text-xs text-orange-400 border border-[#242836]">
                  {pkg.rundeps?.length || 0}
                </span>
              </div>

              {#if pkg.rundeps && pkg.rundeps.length > 0}
                <div class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {#each pkg.rundeps as dep}
                    {@const parsed = parseDep(dep)}
                    <div class="flex items-center justify-between rounded-lg border border-[#242836] bg-[#0d0f14] px-3 py-2 text-xs">
                      <div class="flex items-center gap-2 min-w-0">
                        {#if parsed.hasPackage}
                          <a
                            href="#/package/{parsed.target}"
                            class="font-mono font-medium text-orange-400 hover:underline truncate"
                          >
                            {parsed.target}
                          </a>
                        {:else}
                          <span class="font-mono text-[#e8eaf0] truncate">{parsed.target}</span>
                        {/if}
                      </div>

                      {#if parsed.hasPackage}
                        <span class="text-[10px] text-[#8891a8] shrink-0 ml-2">In repo</span>
                      {/if}
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-xs text-[#8891a8]">
                  No explicit runtime dependencies defined. moss resolves dynamic library dependencies automatically via ELF analysis.
                </p>
              {/if}
            </div>
          </div>
        {/if}

        <!-- 3. SUBPACKAGES TAB -->
        {#if activeTab === 'subpackages' && pkg.packages && pkg.packages.length > 0}
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              {#each pkg.packages as sub}
                <div class="rounded-xl border border-[#242836] bg-[#13161d] p-5 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-base font-bold text-orange-400">{sub.name}</span>
                    <button
                      type="button"
                      onclick={() => copyToClipboard(`sudo moss package add ${sub.name}`, sub.name)}
                      class="flex items-center gap-1 rounded bg-[#1a1e28] px-2 py-1 font-mono text-xs text-[#8891a8] border border-[#242836] hover:text-[#e8eaf0]"
                      title="Copy install command"
                    >
                      {#if copiedHash === sub.name}
                        <Check class="h-3.5 w-3.5 text-emerald-400" />
                        <span class="text-emerald-400">Copied</span>
                      {:else}
                        <Copy class="h-3.5 w-3.5" />
                        <span>moss add</span>
                      {/if}
                    </button>
                  </div>

                  {#if sub.summary}
                    <p class="text-xs text-[#8891a8] leading-relaxed">{sub.summary}</p>
                  {/if}

                  {#if sub.paths && sub.paths.length > 0}
                    <div class="border-t border-[#242836]/60 pt-3">
                      <div class="text-[11px] font-semibold text-[#8891a8] uppercase tracking-wider mb-1.5">
                        Matched Paths:
                      </div>
                      <div class="space-y-1">
                        {#each sub.paths as path}
                          <div class="rounded bg-[#0d0f14] px-2 py-1 font-mono text-[11px] text-[#8891a8]">
                            {path}
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- 4. BUILD PHASES TAB -->
        {#if activeTab === 'build'}
          <div class="space-y-4">
            {#if pkg.environment}
              <div class="rounded-xl border border-[#242836] bg-[#13161d] p-5">
                <div class="font-mono text-xs font-semibold text-orange-400 mb-2">environment :</div>
                <pre class="overflow-x-auto rounded-lg bg-[#0d0f14] p-4 text-xs font-mono text-[#e8eaf0] border border-[#242836]"><code>{pkg.environment}</code></pre>
              </div>
            {/if}

            {#if pkg.setup}
              <div class="rounded-xl border border-[#242836] bg-[#13161d] p-5">
                <div class="font-mono text-xs font-semibold text-orange-400 mb-2">setup :</div>
                <pre class="overflow-x-auto rounded-lg bg-[#0d0f14] p-4 text-xs font-mono text-[#e8eaf0] border border-[#242836]"><code>{pkg.setup}</code></pre>
              </div>
            {/if}

            {#if pkg.build}
              <div class="rounded-xl border border-[#242836] bg-[#13161d] p-5">
                <div class="font-mono text-xs font-semibold text-orange-400 mb-2">build :</div>
                <pre class="overflow-x-auto rounded-lg bg-[#0d0f14] p-4 text-xs font-mono text-[#e8eaf0] border border-[#242836]"><code>{pkg.build}</code></pre>
              </div>
            {/if}

            {#if pkg.install}
              <div class="rounded-xl border border-[#242836] bg-[#13161d] p-5">
                <div class="font-mono text-xs font-semibold text-orange-400 mb-2">install :</div>
                <pre class="overflow-x-auto rounded-lg bg-[#0d0f14] p-4 text-xs font-mono text-[#e8eaf0] border border-[#242836]"><code>{pkg.install}</code></pre>
              </div>
            {/if}

            {#if pkg.check}
              <div class="rounded-xl border border-[#242836] bg-[#13161d] p-5">
                <div class="font-mono text-xs font-semibold text-orange-400 mb-2">check :</div>
                <pre class="overflow-x-auto rounded-lg bg-[#0d0f14] p-4 text-xs font-mono text-[#e8eaf0] border border-[#242836]"><code>{pkg.check}</code></pre>
              </div>
            {/if}
          </div>
        {/if}

        <!-- 5. RAW RECIPE TAB -->
        {#if activeTab === 'raw'}
          <div class="rounded-xl border border-[#242836] bg-[#13161d] p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-orange-400 font-semibold">stone.yaml</span>
                <span class="text-xs text-[#8891a8]">— boulder recipe specification</span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick={() => copyToClipboard(generateRecipeYaml(pkg), 'yaml')}
                  class="flex items-center gap-1.5 rounded-lg border border-[#242836] bg-[#1a1e28] px-3 py-1.5 text-xs text-[#8891a8] hover:text-[#e8eaf0] transition"
                >
                  {#if copiedHash === 'yaml'}
                    <Check class="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  {:else}
                    <Copy class="h-3.5 w-3.5" />
                    <span>Copy YAML</span>
                  {/if}
                </button>

                <a
                  href={pkg.recipeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 rounded-lg border border-[#242836] bg-[#1a1e28] px-3 py-1.5 text-xs text-orange-400 hover:bg-[#242836] transition"
                >
                  <ExternalLink class="h-3.5 w-3.5" />
                  <span>GitHub Blob</span>
                </a>
              </div>
            </div>

            <pre class="overflow-x-auto rounded-xl bg-[#0d0f14] p-5 text-xs font-mono text-[#e8eaf0] border border-[#242836] leading-relaxed"><code>{generateRecipeYaml(pkg)}</code></pre>
          </div>
        {/if}
      </div>

      <!-- Related Packages Section -->
      {#if relatedPackages.length > 0}
        <div class="border-t border-[#242836] pt-10">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-bold text-[#e8eaf0]">
                More in <span class="text-orange-400">{pkg.category}</span>
              </h2>
              <p class="text-xs text-[#8891a8]">Other packages in the same ecosystem category.</p>
            </div>
            <a
              href="#/categories/{encodeURIComponent(pkg.category || 'Other')}"
              class="text-xs font-medium text-orange-400 hover:underline"
            >
              View all {pkg.category} packages →
            </a>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {#each relatedPackages as related}
              <PackageCard pkg={related} />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
