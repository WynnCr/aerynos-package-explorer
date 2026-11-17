<div class="mx-auto max-w-2xl space-y-10 px-4 py-10 sm:px-6">
  <header class="space-y-3">
    <h1 class="text-xl font-semibold">About</h1>
    <p>
      This is a search page for the package recipes in
      <a class="link" href="https://github.com/aerynOS/recipes">aerynOS/recipes</a>. It was made by
      <a class="link" href="https://github.com/WynnCr">WynnCr</a> and is
      <strong>not an official aerynOS project</strong>. The aerynOS team doesn't run, maintain or
      endorse it, so if something here looks wrong, check the recipe itself before filing anything upstream.
    </p>
    <p>
      For downloads and documentation, go to
      <a class="link" href="https://aerynos.com">aerynos.com</a> and
      <a class="link" href="https://aerynos.dev">aerynos.dev</a>.
    </p>
  </header>

  <section class="space-y-3">
    <h2 class="text-lg font-semibold">How it works</h2>
    <p>
      A GitHub Action runs every 4 hours. It clones the recipes repository, reads every
      <code>stone.yaml</code> (and <code>monitoring.yaml</code>), sorts packages into categories,
      and writes one JSON file that ships with the site. There is no backend: your browser loads
      that file and searches it with Fuse.js.
    </p>
    <p>
      Categories are guessed from package names and descriptions by a few keyword rules. They are
      not aerynOS metadata and some will be wrong, which is why so many packages land in
      “Other”.
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-lg font-semibold">Terms you'll see</h2>
    <dl class="space-y-3">
      <div>
        <dt class="font-mono">moss</dt>
        <dd class="text-muted">
          The package manager. Installs change an atomic system state, so you can roll back.
          Install a package with <code>sudo moss package add &lt;name&gt;</code>.
        </dd>
      </div>
      <div>
        <dt class="font-mono">boulder</dt>
        <dd class="text-muted">
          The build tool. It builds a recipe inside an unprivileged container:
          <code>boulder build stone.yaml</code>.
        </dd>
      </div>
      <div>
        <dt class="font-mono">stone.yaml</dt>
        <dd class="text-muted">
          A recipe. It lists metadata, upstream sources and checksums, build steps, and any
          subpackages. Recipes live in <code>recipes/&lt;letter&gt;/&lt;name&gt;/</code>.
        </dd>
      </div>
      <div>
        <dt class="font-mono">recipe vs. binary package</dt>
        <dd class="text-muted">
          One recipe can produce several binary packages (<code>foo</code>, <code>foo-devel</code>, …).
          moss installs the binary packages, which is why the install command on this site
          sometimes uses a different name than the recipe.
        </dd>
      </div>
    </dl>
  </section>

  <section class="space-y-4">
    <h2 class="text-lg font-semibold">Channels and streams</h2>
    <p>
      A <em>channel</em> pairs a branch of the recipes repository with the repository of built
      packages for it. The <code>main</code> channel tracks the <code>main</code> branch of
      aerynOS/recipes. It consists of:
    </p>
    <ul class="list-disc space-y-1 pl-5">
      <li>
        a pool (<code>pool/</code>) of built archives, currently <code>.stone</code> files;
      </li>
      <li>
        history snapshots (<code>history/&lt;unix-epoch&gt;</code>), each with a
        <code>stone.index</code> pointing into the pool and representing <code>main</code> at that moment.
        Tagged snapshots are kept longer than the default 14-day rolling window;
      </li>
      <li>
        <code>vessel</code>, which indexes new builds into snapshots and moves the stream pointers.
      </li>
    </ul>
    <p>Two streams point into a channel:</p>
    <ul class="list-disc space-y-1 pl-5">
      <li>
        <code>stream/unstable</code> is what moss uses by default (named unstable while aerynOS is in alpha, but functioning as the default user stream). Maintainers point it at a tag
        once a build has been checked.
      </li>
      <li>
        <code>stream/volatile</code> follows the newest snapshot as builds finish. It is meant for
        maintainers and automated testing.
      </li>
    </ul>
    <p>A moss repository entry that ties these together looks like this:</p>
<pre><code>unstable &#123;
    description "aerynOS unstable repository stream"
    base-uri "https://cdn.aerynos.dev/"
    channel main
    version "stream/unstable"
    arch x86_64
    priority 5
    active #true
&#125;</code></pre>

    <p class="text-sm text-muted">
      The "both" and "volatile only" labels on this site come from the x86_64 index of each stream.
      A package that is only built for another architecture would show as not in either stream.
    </p>

    <h3 class="pt-2 font-semibold">From recipe to your machine</h3>
    <ol class="list-decimal space-y-1 pl-5">
      <li>A pull request is merged into <code>aerynOS/recipes</code> and Summit builds it.</li>
      <li><code>vessel</code> indexes the build and moves <code>stream/volatile</code> to the new snapshot.</li>
      <li>Maintainers check the snapshot, tag it, and point <code>stream/unstable</code> at the tag.</li>
    </ol>

    <h3 class="pt-2 font-semibold">Why versions here can be ahead of your system</h3>
    <p>
      This site shows versions from <code>stone.yaml</code> on <code>main</code>, so it reflects
      the volatile stream. Your system follows unstable, which only moves at step 3. A package
      marked “volatile only” exists in the newest snapshot but hasn't been promoted yet.
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-lg font-semibold">Links</h2>
    <ul class="space-y-1">
      <li><a class="link" href="https://aerynos.com">aerynos.com</a> <span class="text-muted">· the project</span></li>
      <li><a class="link" href="https://aerynos.dev">aerynos.dev</a> <span class="text-muted">· documentation</span></li>
      <li><a class="link" href="https://dash.aerynos.dev">dash.aerynos.dev</a> <span class="text-muted">· Summit, the build dashboard</span></li>
      <li><a class="link" href="https://github.com/aerynOS">github.com/aerynOS</a> <span class="text-muted">· source</span></li>
      <li><a class="link" href="https://github.com/WynnCr/aerynos-package-explorer">github.com/WynnCr/aerynos-package-explorer</a> <span class="text-muted">· this site</span></li>
    </ul>
  </section>
</div>
