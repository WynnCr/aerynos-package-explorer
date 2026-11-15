<script lang="ts">
  import {
    Terminal,
    Box,
    Layers,
    FolderGit2,
    ExternalLink,
    GitBranch,
    RefreshCw,
    Info
  } from 'lucide-svelte';
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

  <!-- Unofficial Community Project Notice -->
  <section class="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6 space-y-3">
    <div class="flex items-center gap-2.5">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
        <Info class="h-4 w-4" />
      </div>
      <div>
        <h2 class="text-base font-bold text-[#e8eaf0]">Unofficial Community Project</h2>
        <span class="text-xs text-sky-400">Independent Package Discovery Tool</span>
      </div>
    </div>
    <p class="text-xs text-[#8891a8] leading-relaxed">
      <strong>AerynOS Package Explorer</strong> is an independent, community-created open source project developed by <a href="https://github.com/WynnCr" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:underline">WynnCr</a>. It is <strong>not</strong> an official project of AerynOS, nor is it endorsed, operated, or maintained by the official AerynOS distribution team.
    </p>
    <p class="text-xs text-[#8891a8] leading-relaxed">
      This explorer is designed as a convenience utility to help community members, packagers, and users search package recipes, inspect dependency trees, and see repository stream availability. For official project inquiries, downloads, and documentation, please visit the official resources at <a href="https://aerynos.com" target="_blank" rel="noopener noreferrer" class="text-[#e8eaf0] hover:underline font-medium">aerynos.com</a> and <a href="https://aerynos.dev" target="_blank" rel="noopener noreferrer" class="text-[#e8eaf0] hover:underline font-medium">aerynos.dev</a>.
    </p>
  </section>

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

  <!-- Repository Architecture: Channel & Streams -->
  <section class="space-y-6">
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Info class="h-4 w-4" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-[#e8eaf0]">Understanding AerynOS Repository Architecture</h2>
        <p class="text-xs text-[#8891a8]">Channels, history identifiers, binary pools, and repository streams in moss.</p>
      </div>
    </div>

    <div class="rounded-2xl border border-[#242836] bg-[#13161d] p-6 space-y-6">
      <!-- Explanatory Overview of Channel & Vessel -->
      <div class="space-y-3 text-xs text-[#8891a8] leading-relaxed">
        <p>
          In the AerynOS distribution architecture, a <strong class="text-[#e8eaf0]">Channel</strong> describes the coupling between a recipes monorepository in git and the associated moss-format repository of compiled binary artefacts. The <strong class="text-orange-400 font-medium">main Channel</strong> is configured to track the <code class="font-mono text-orange-300">main</code> branch of <a href="https://github.com/aerynOS/recipes" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:underline">aerynOS/recipes</a>.
        </p>
        <p>
          A Channel comprises:
        </p>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong class="text-[#e8eaf0]">Artifact Pool (<code class="text-orange-300 font-mono">pool/</code>)</strong>: The collection of moss-format binary archives (currently called <code class="font-mono text-orange-300">.stone</code>).</li>
          <li><strong class="text-[#e8eaf0]">History Identifiers (<code class="text-orange-300 font-mono">history/&lt;unix-epoch&gt;</code>)</strong>: Snapshot versions containing a <code class="text-orange-300 font-mono">stone.index</code> referencing pool artefacts. Each snapshot represents the state of the HEAD of the main branch at that point in time. Versions can be tagged for retention beyond the default 14-day rolling window.</li>
          <li><strong class="text-[#e8eaf0]">vessel Repository Manager</strong>: Automagically maintains repository state, indexes new builds into history identifiers, and manages stream pointers.</li>
        </ul>
      </div>

      <!-- Streams Grid: Unstable vs. Volatile -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Default Unstable Stream -->
        <div class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm font-bold text-emerald-400">stream/unstable</span>
            <span class="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase font-semibold text-emerald-300 border border-emerald-500/30">Default User Stream</span>
          </div>
          <p class="text-xs text-[#8891a8] leading-relaxed">
            The curated, default stream configured in <code class="font-mono text-emerald-300">moss</code> on AerynOS installations. Maintainers manually repoint the <code class="font-mono text-emerald-300">unstable</code> stream to a designated <strong class="text-[#e8eaf0]">tag</strong> once a volatile milestone is verified and ready for end-user systems. Tagging preserves historical unstable streams for upgrade and regression testing.
          </p>
          <div class="rounded-lg bg-[#0d0f14] p-2.5 font-mono text-xs text-[#e8eaf0] border border-[#242836]">
            <code>version "stream/unstable"</code>
          </div>
        </div>

        <!-- Volatile Stream -->
        <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm font-bold text-amber-400">stream/volatile</span>
            <span class="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase font-semibold text-amber-300 border border-amber-500/30">Rolling Tip Pointer</span>
          </div>
          <p class="text-xs text-[#8891a8] leading-relaxed">
            The continually updated "tip or HEAD pointer" of the main Channel's binary repository (defined in <code class="font-mono text-amber-300">moss-root-index.json</code>). As new builds are completed, <code class="font-mono text-amber-300">vessel</code> automagically advances this pointer to the newest history identifier. Intended for maintainers and automated QA.
          </p>
          <div class="rounded-lg bg-[#0d0f14] p-2.5 font-mono text-xs text-amber-400/90 border border-[#242836] flex items-center justify-between">
            <span>Rolling HEAD pointer</span>
            <span class="text-[10px] text-[#8891a8]">Auto-updated by vessel</span>
          </div>
        </div>
      </div>

      <!-- Moss Client Configuration Example -->
      <div class="rounded-xl border border-[#242836] bg-[#0d0f14] p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-[#8891a8]">
            moss Client Configuration Example
          </h3>
          <span class="text-[11px] text-[#8891a8]">How moss ties channels & streams together</span>
        </div>
        <pre class="overflow-x-auto rounded-lg bg-[#13161d] p-3 font-mono text-xs text-[#e8eaf0] border border-[#242836] leading-relaxed"><code>unstable &#123;
    description "AerynOS unstable repository stream"
    base-uri "https://cdn.aerynos.dev/"  # Mirror-friendly base URI
    channel main                         # Git recipe branch coupling
    version "stream/unstable"            # Stream pointer (repointed to tags)
    arch x86_64
    priority 5
    active #true
&#125;</code></pre>
      </div>

      <!-- Stream Lifecycle & Promotion Workflow -->
      <div class="rounded-xl border border-[#242836] bg-[#0d0f14] p-5 space-y-4">
        <div>
          <h3 class="text-sm font-bold text-[#e8eaf0] flex items-center gap-2">
            <GitBranch class="h-4 w-4 text-orange-400" />
            <span>Recipe to Stream Lifecycle</span>
          </h3>
          <p class="text-xs text-[#8891a8] mt-1 leading-relaxed">
            How software progresses from recipe pull request to your system:
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="rounded-lg border border-[#242836] bg-[#13161d] p-3.5 space-y-1.5">
            <div class="flex items-center gap-2 font-semibold text-[#e8eaf0]">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-mono">1</span>
              <span>Recipe Merged (Channel main)</span>
            </div>
            <p class="text-[#8891a8] text-[11px] leading-relaxed">
              Pull request merged into <code class="text-orange-300 font-mono">aerynOS/recipes:main</code>. Boulder builds the package in Summit.
            </p>
          </div>

          <div class="rounded-lg border border-amber-500/20 bg-[#13161d] p-3.5 space-y-1.5">
            <div class="flex items-center gap-2 font-semibold text-amber-300">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-mono">2</span>
              <span>Indexed to volatile stream</span>
            </div>
            <p class="text-[#8891a8] text-[11px] leading-relaxed">
              <code class="text-amber-400 font-mono">vessel</code> indexes the build into a new history snapshot and points <code class="text-amber-400 font-mono">stream/volatile</code> to it.
            </p>
          </div>

          <div class="rounded-lg border border-emerald-500/20 bg-[#13161d] p-3.5 space-y-1.5">
            <div class="flex items-center gap-2 font-semibold text-emerald-300">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono">3</span>
              <span>Tagged & Promoted to unstable</span>
            </div>
            <p class="text-[#8891a8] text-[11px] leading-relaxed">
              Maintainers verify the snapshot, create a version tag, and repoint <code class="text-emerald-400 font-mono">stream/unstable</code> to the tag.
            </p>
          </div>
        </div>

        <div class="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-[#8891a8] flex items-start gap-2.5">
          <Info class="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div class="space-y-1 text-[11px] leading-relaxed">
            <p>
              <strong class="text-amber-300">Nomenclature Note:</strong> In AerynOS terminology, <strong class="text-[#e8eaf0]">main</strong> is the Channel, while <strong class="text-[#e8eaf0]">unstable</strong> and <strong class="text-[#e8eaf0]">volatile</strong> are Streams within that channel. End-user systems follow <code class="font-mono text-emerald-300">stream/unstable</code>.
            </p>
            <p class="pt-1 text-[#8891a8]/90">
              <strong class="text-[#e8eaf0]">Why might an Explorer version differ from your installed version?</strong> This portal displays metadata parsed directly from upstream git recipes (<code class="font-mono text-orange-300">stone.yaml</code>). When a version bump is merged, the new build is indexed at the tip of the <code class="font-mono text-amber-300">volatile</code> stream first. Until maintainers tag the milestone and repoint <code class="font-mono text-emerald-300">stream/unstable</code>, the binary version installed by moss on user machines will remain on the tagged unstable release.
            </p>
          </div>
        </div>
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
