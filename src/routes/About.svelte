<script lang="ts">
  import {
    Terminal,
    Box,
    Layers,
    FolderGit2,
    CheckCircle2,
    ExternalLink,
    Zap,
    Shield,
    Server,
    Cpu,
    GitBranch,
    RefreshCw,
    Info,
    Copy,
    Check
  } from 'lucide-svelte';
  import { copyToClipboard } from '$lib/utils/clipboard';

  let copied = $state(false);

  async function copyVolatileRepo() {
    const cmd = `sudo moss repo add volatile https://cdn.aerynos.dev --root-index channel=main,version=stream/volatile -p 10\nsudo moss repo refresh`;
    const ok = await copyToClipboard(cmd);
    if (ok) {
      copied = true;
      setTimeout(() => copied = false, 2500);
    }
  }
</script>

<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
  <!-- Title / Header -->
  <div class="space-y-4 border-b border-[#242836] pb-8 text-center sm:text-left">
    <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
      <span>Independent &bull; Atomic &bull; Performance-focused</span>
    </div>
    <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#e8eaf0]">
      About AerynOS & Package Explorer
    </h1>
    <p class="text-base text-[#8891a8] max-w-2xl leading-relaxed">
      AerynOS is an independent, state-of-the-art Linux operating system engineered from scratch for performance, atomicity, and developer agility.
    </p>
  </div>

  <!-- Core Ecosystem Grid -->
  <section class="space-y-6">
    <h2 class="text-xl font-bold text-[#e8eaf0]">The AerynOS Ecosystem Architecture</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- moss card -->
      <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-6 space-y-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Terminal class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-[#e8eaf0]">moss</h3>
            <span class="text-xs text-[#8891a8]">Transactional Package Manager</span>
          </div>
        </div>
        <p class="text-xs text-[#8891a8] leading-relaxed">
          Written in modern Rust, <code class="text-orange-400 font-mono text-[11px]">moss</code> operates on atomic transaction states. Installing or upgrading software modifies a content-addressed system tree, enabling instant, guaranteed rollbacks without system instability.
        </p>
        <div class="rounded-lg bg-[#0d0f14] p-2.5 font-mono text-xs text-[#e8eaf0] border border-[#242836]">
          <code>sudo moss package add &lt;pkg&gt;</code>
        </div>
      </div>

      <!-- boulder card -->
      <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-6 space-y-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Box class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-[#e8eaf0]">boulder</h3>
            <span class="text-xs text-[#8891a8]">Rootless Containerized Builder</span>
          </div>
        </div>
        <p class="text-xs text-[#8891a8] leading-relaxed">
          <code class="text-sky-400 font-mono text-[11px]">boulder</code> compiles packages in hermetic, unprivileged container namespaces. It guarantees reproducible builds from clean upstream tarballs without host pollution.
        </p>
        <div class="rounded-lg bg-[#0d0f14] p-2.5 font-mono text-xs text-[#e8eaf0] border border-[#242836]">
          <code>boulder build stone.yaml</code>
        </div>
      </div>

      <!-- stone.yaml card -->
      <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-6 space-y-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-[#e8eaf0]">stone.yaml</h3>
            <span class="text-xs text-[#8891a8]">Declarative Recipe Specification</span>
          </div>
        </div>
        <p class="text-xs text-[#8891a8] leading-relaxed">
          The packaging format for AerynOS. Each recipe defines metadata, upstream checksums, build phases (<code class="text-[#e8eaf0] font-mono text-[11px]">setup</code>, <code class="text-[#e8eaf0] font-mono text-[11px]">build</code>, <code class="text-[#e8eaf0] font-mono text-[11px]">install</code>), subpackages, and compiler flags.
        </p>
        <div class="rounded-lg bg-[#0d0f14] p-2.5 font-mono text-xs text-[#e8eaf0] border border-[#242836]">
          <code>recipes/&lt;letter&gt;/&lt;pkg&gt;/stone.yaml</code>
        </div>
      </div>

      <!-- recipes repo card -->
      <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-6 space-y-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <FolderGit2 class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-[#e8eaf0]">aerynOS/recipes</h3>
            <span class="text-xs text-[#8891a8]">Official Git Source of Truth</span>
          </div>
        </div>
        <p class="text-xs text-[#8891a8] leading-relaxed">
          All recipes are versioned in git and sharded alphabetically into letter directories (`a/` to `z/`). Pull requests trigger automated validation and test builds in Summit.
        </p>
        <div class="rounded-lg bg-[#0d0f14] p-2.5 font-mono text-xs text-[#e8eaf0] border border-[#242836]">
          <code>github.com/aerynOS/recipes</code>
        </div>
      </div>
    </div>
  </section>

  <!-- How Package Explorer Works -->
  <section class="rounded-2xl border border-[#242836] bg-[#13161d] p-8 space-y-6">
    <div class="flex items-center gap-3">
      <RefreshCw class="h-6 w-6 text-orange-400" />
      <h2 class="text-xl font-bold text-[#e8eaf0]">How Package Explorer Works</h2>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#8891a8]">
      <div class="space-y-2">
        <div class="flex items-center gap-2 font-semibold text-[#e8eaf0]">
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-mono">1</span>
          <span>Daily Ingestion</span>
        </div>
        <p class="leading-relaxed">
          Automated GitHub Actions workflows parse the upstream recipes repository, analyzing all <code class="font-mono text-orange-300">stone.yaml</code> and <code class="font-mono text-orange-300">monitoring.yaml</code> files.
        </p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center gap-2 font-semibold text-[#e8eaf0]">
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-mono">2</span>
          <span>Static Optimization</span>
        </div>
        <p class="leading-relaxed">
          Metadata is normalized, classified into high-level categories, and compiled into an optimized static JSON index bundled directly into the web application.
        </p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center gap-2 font-semibold text-[#e8eaf0]">
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-mono">3</span>
          <span>Client-Side Search</span>
        </div>
        <p class="leading-relaxed">
          Zero server dependencies. Searches and filters execute locally in milliseconds via Fuse.js with weighted scoring across names, descriptions, and dependencies.
        </p>
      </div>
    </div>
  </section>

  <!-- Repository Channels Architecture: Unstable vs. Volatile -->
  <section class="space-y-6">
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Info class="h-4 w-4" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-[#e8eaf0]">Understanding AerynOS Repository Channels</h2>
        <p class="text-xs text-[#8891a8]">How software builds, streams, and promotions work in moss and boulder.</p>
      </div>
    </div>

    <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Default Unstable Channel -->
        <div class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm font-bold text-emerald-400">stream/unstable</span>
            <span class="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase font-semibold text-emerald-300 border border-emerald-500/30">Default Channel</span>
          </div>
          <p class="text-xs text-[#8891a8] leading-relaxed">
            The standard repository configured out-of-the-box on AerynOS systems. Packages here have successfully compiled, passed initial validation tests, and are guaranteed to have stable ABI dependencies.
          </p>
          <div class="rounded-lg bg-[#0d0f14] p-2.5 font-mono text-xs text-[#e8eaf0] border border-[#242836]">
            <code>sudo moss package add &lt;pkg&gt;</code>
          </div>
        </div>

        <!-- Volatile Staging Channel -->
        <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm font-bold text-amber-400">stream/volatile</span>
            <span class="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase font-semibold text-amber-300 border border-amber-500/30">Staging Stream</span>
          </div>
          <p class="text-xs text-[#8891a8] leading-relaxed">
            The active staging channel where recipes merged into the upstream git repository land first. If a package (like newly packaged utilities or quick updates) is indexed in this explorer but moss reports not found, it is currently in <code class="text-amber-400 font-mono">volatile</code> awaiting promotion.
          </p>
          <div class="rounded-lg bg-[#0d0f14] p-2.5 font-mono text-xs text-[#e8eaf0] border border-[#242836]">
            <code>moss repo add volatile https://cdn.aerynos.dev ...</code>
          </div>
        </div>
      </div>

      <!-- How to Enable Volatile -->
      <div class="rounded-xl border border-[#242836] bg-[#0d0f14] p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-[#e8eaf0]">Enabling the Volatile Stream on your AerynOS machine</h3>
            <p class="text-xs text-[#8891a8] mt-0.5">Run these commands in your terminal to access cutting-edge packages before their unstable graduation:</p>
          </div>
          <button
            type="button"
            onclick={copyVolatileRepo}
            class="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-orange-400 active:scale-95 transition shrink-0"
          >
            {#if copied}
              <Check class="h-3.5 w-3.5" />
              <span>Copied!</span>
            {:else}
              <Copy class="h-3.5 w-3.5" />
              <span>Copy Commands</span>
            {/if}
          </button>
        </div>

        <pre class="overflow-x-auto rounded-lg bg-[#13161d] p-3 text-xs font-mono text-[#e8eaf0] border border-[#242836] leading-relaxed"><code>sudo moss repo add volatile https://cdn.aerynos.dev --root-index channel=main,version=stream/volatile -p 10
sudo moss repo refresh
sudo moss package add &lt;pkg&gt;</code></pre>
      </div>
    </div>
  </section>

  <!-- Official Resources and Links -->
  <section class="space-y-4">
    <h2 class="text-xl font-bold text-[#e8eaf0]">Official Resources & Links</h2>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      <a
        href="https://aerynos.com"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col justify-between rounded-xl border border-[#242836] bg-[#13161d] p-4 hover:border-orange-500/50 hover:bg-[#1a1e28] transition"
      >
        <div>
          <div class="font-bold text-[#e8eaf0]">AerynOS Homepage</div>
          <div class="text-[#8891a8] mt-1">Official distribution overview and downloads.</div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-orange-400 font-medium">
          <span>aerynos.com</span>
          <ExternalLink class="h-3 w-3" />
        </div>
      </a>

      <a
        href="https://aerynos.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col justify-between rounded-xl border border-[#242836] bg-[#13161d] p-4 hover:border-orange-500/50 hover:bg-[#1a1e28] transition"
      >
        <div>
          <div class="font-bold text-[#e8eaf0]">Documentation</div>
          <div class="text-[#8891a8] mt-1">Comprehensive guides on moss, boulder, and packaging.</div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-orange-400 font-medium">
          <span>aerynos.dev</span>
          <ExternalLink class="h-3 w-3" />
        </div>
      </a>

      <a
        href="https://dash.aerynos.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col justify-between rounded-xl border border-[#242836] bg-[#13161d] p-4 hover:border-orange-500/50 hover:bg-[#1a1e28] transition"
      >
        <div>
          <div class="font-bold text-[#e8eaf0]">Summit Dashboard</div>
          <div class="text-[#8891a8] mt-1">Continuous integration & package build pipeline.</div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-orange-400 font-medium">
          <span>dash.aerynos.dev</span>
          <ExternalLink class="h-3 w-3" />
        </div>
      </a>

      <a
        href="https://github.com/aerynOS"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col justify-between rounded-xl border border-[#242836] bg-[#13161d] p-4 hover:border-orange-500/50 hover:bg-[#1a1e28] transition"
      >
        <div>
          <div class="font-bold text-[#e8eaf0]">GitHub Organization</div>
          <div class="text-[#8891a8] mt-1">Open-source code, toolchain repositories, and recipes.</div>
        </div>
        <div class="mt-3 flex items-center gap-1 text-orange-400 font-medium">
          <span>github.com/aerynOS</span>
          <ExternalLink class="h-3 w-3" />
        </div>
      </a>
    </div>
  </section>
</div>
