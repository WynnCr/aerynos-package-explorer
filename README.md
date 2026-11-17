# aerynOS package explorer

A small search page for the packages in [aerynOS/recipes](https://github.com/aerynOS/recipes).
Type a name, get the version, summary, license, dependencies and the `moss` command to install it.

**This is unofficial.** I'm not part of the aerynOS project and it doesn't run or endorse this site.
Official resources are at [aerynos.com](https://aerynos.com) and [aerynos.dev](https://aerynos.dev).

## How it works

There's no backend. A GitHub Action runs every 4 hours, clones the recipes repo, parses every `stone.yaml`,
and writes `static/data/packages.json` (the search index), `static/data/details/<letter>.json` (build
scripts, upstreams and sub-package paths, loaded when you open a package) and `channels.json`, which
records what's in the unstable and volatile streams). The site is a static Svelte app that loads those files and searches them in
the browser with Fuse.js.

Two things worth knowing:

- Versions come from the recipes on `main`, i.e. the volatile stream. Systems follow the unstable
  stream, which is only moved to a new tag after maintainers have checked a build. So a version here
  can be newer than what `moss` will install. The About page has the details.
- Categories are guessed from package names and descriptions (see `inferCategory` in
  `src/lib/utils/format.ts`). They aren't aerynOS metadata and some are wrong.
  `scripts/generate-index.ts`). They aren't AerynOS metadata and some are wrong.
  Rework the indexer: deterministic output, sanity guards, fewer fake fields

## Running it locally

You need Node 20+ and [pnpm](https://pnpm.io).

```sh
git clone https://github.com/WynnCr/aerynos-package-explorer.git
cd aerynos-package-explorer
pnpm install
pnpm dev
```

Then open http://localhost:5173.

Other commands:

```sh
pnpm build            # production build into dist/
pnpm check            # svelte-check / type check
pnpm test-parser      # run the stone.yaml parser against fixtures
pnpm generate-index   # rebuild static/data/packages.json
pnpm validate-dataset # sanity-check the generated files
```

`generate-index` shallow-clones aerynOS/recipes into a temp directory (needs `git`). To use a
clone you already have: `pnpm generate-index --local path/to/recipes` or `RECIPES_DIR=...`.
The output is deterministic, so running it twice on the same commit changes nothing. It refuses
to write if more than 1% of recipes fail to parse or the index shrinks by more than 5%
(`--force` overrides the second check).

`python3 scripts/fetch-channels.py` refreshes `static/data/channels.json` (which packages are in
the unstable and volatile streams, x86_64 only). It needs `libzstd` and network access to
cdn.aerynos.dev.

## Deployment

`.github/workflows/update-index.yml` runs every 4 hours (at :17 UTC), on pushes to `main`, and on demand. It
regenerates the index, commits it if it changed, builds the site and publishes to GitHub Pages
(Settings → Pages → Source: GitHub Actions).

## Stack

Svelte 5, Vite, Tailwind CSS 4, TypeScript, Fuse.js, svelte-spa-router (hash routing, so it works
on static hosting).

## Limits

- Channel labels (unstable / volatile) are read from the x86_64 stream indexes only.
- The index reflects recipes in git. Whether a package has actually been built for your
  architecture depends on the build farm.
- Search is fuzzy and loose by design; for exact matches use the letter filter or the recipe repo.

## Contributing

Issues and pull requests are welcome. Please run `pnpm check` first, and `pnpm test-parser` if you
touch the parser.

## License

[WTFPL](LICENSE). aerynOS, moss and boulder belong to the aerynOS project.
