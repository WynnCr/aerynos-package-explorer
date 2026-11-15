# aerynOS package explorer

A small search page for the packages in [aerynOS/recipes](https://github.com/aerynOS/recipes).
Type a name, get the version, summary, license, dependencies and the `moss` command to install it.

**This is unofficial.** I'm not part of the aerynOS project and it doesn't run or endorse this site.
Official resources are at [aerynos.com](https://aerynos.com) and [aerynos.dev](https://aerynos.dev).

## How it works

There's no backend. A GitHub Action runs every 4 hours, clones the recipes repo, parses every `stone.yaml`,
and writes `static/data/packages.json` (plus `channels.json`, which records what's in the unstable
and volatile streams). The site is a static Svelte app that loads those files and searches them in
the browser with Fuse.js.

Two things worth knowing:

- Versions come from the recipes on `main`, i.e. the volatile stream. Systems follow the unstable
  stream, which is only moved to a new tag after maintainers have checked a build. So a version here
  can be newer than what `moss` will install. The About page has the details.
- Categories are guessed from package names and descriptions (see `inferCategory` in
  `src/lib/utils/format.ts`). They aren't aerynOS metadata and some are wrong.

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
pnpm generate-index   # rebuild static/data/packages.json from GitHub
```

`generate-index` uses the GitHub API, which allows 60 requests an hour without a token. Set
`GITHUB_TOKEN` to get further, or run it against a local clone with
`pnpm exec tsx scripts/generate-index.ts --local path/to/recipes`, which is what the Action does.

## Deployment

`.github/workflows/update-index.yml` runs every 4 hours (at :17 UTC), on pushes to `main`, and on demand. It
regenerates the index, commits it if it changed, builds the site and publishes to GitHub Pages
(Settings → Pages → Source: GitHub Actions).

## Stack

Svelte 5, Vite, Tailwind CSS 4, TypeScript, Fuse.js, svelte-spa-router (hash routing, so it works
on static hosting).

## Limits

- The index reflects recipes in git. Whether a package has actually been built for your
  architecture depends on the build farm.
- Search is fuzzy and loose by design; for exact matches use the letter filter or the recipe repo.

## Contributing

Issues and pull requests are welcome. Please run `pnpm check` first, and `pnpm test-parser` if you
touch the parser.

## License

[WTFPL](LICENSE). aerynOS, moss and boulder belong to the aerynOS project.
