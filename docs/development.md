# Development

Use Node.js 24 or newer and the pnpm version pinned in `package.json`, installed with
your preferred version manager (such as mise) or the [pnpm installer](https://pnpm.io/installation).
Run commands from the repository root; `pnpm install --frozen-lockfile` installs the
locked dependencies. Use `pnpm add` / `pnpm add -D` for dependency changes and commit
the resulting `pnpm-lock.yaml`. Do not generate an npm lockfile.

## Build and preview

`pnpm dev` serves the site with live updates (`pnpm start` is an alias).
`pnpm build` creates `dist/`; `pnpm preview` serves that production build.

TanStack Start prerenders the React pages and Vite bundles JavaScript and CSS.
Site files live in `src/`; tests and tool configuration stay at the root.
Only `dist/` is deployed. Build-time server files live in ignored `.tanstack/`;
GitHub Pages needs no Node server.

Routes are `/`, `/about`, and `/api`; the latter two are deployed as directory
index files. A static host may append a trailing slash on direct visits.

The default build targets `/`. The deployment workflow sets
`VITE_BASE_PATH=/audio-sort/` and runs the same build command.
For another hosting path, set `VITE_BASE_PATH` when building. Preview uses `sirv-cli`
to serve static files only, with no server rendering or SPA fallback.
To preview the Pages path locally, run `pnpm run build:test-pages`, then
`pnpm exec sirv .test-pages` and open `http://localhost:8080/audio-sort/`.

Prerendering automatically discovers static routes; new static pages need no extra
build configuration. Link crawling is disabled because Start currently duplicates
base-prefixed URLs in the Pages build. Dynamic routes would need concrete URLs
supplied explicitly.

Static files live in root-level `public/`: images in `public/img/` and the
`.nojekyll` marker. There are no vendored JavaScript files. Files are copied unchanged
to `dist/` without a `public/` URL prefix. Use `/img/...` in source CSS; Vite
adjusts these URLs for the deployment path. Application modules and CSS stay in `src/`.

CSS is bundled and minified by Vite. Tailwind supplies Preflight and utilities;
first-party styles preserve the existing design. No Bootstrap overrides are needed.

## Checks

`pnpm run check` runs lint, formatting checks, TypeScript checking, unit tests, and a production build.

- `pnpm run lint`: check first-party JavaScript and TypeScript with Oxlint.
- `pnpm run typecheck`: check TypeScript modules and React pages with strict settings; no files are emitted.
- `pnpm run format`: format with Oxfmt; `pnpm run format:check` checks without editing.
- `pnpm test`: run unit tests; `pnpm run test:watch` reruns them while editing.

TypeScript can infer imported JavaScript modules (`allowJs`), but `checkJs` stays
off until those modules are migrated. Worker payloads are still checked at runtime.

Vendor and generated files are excluded from linting and formatting. Oxfmt formats
source CSS and TSX alongside JavaScript. `src/pages/site-document.tsx` owns the
shared document, header, and footer. Start generates `src/route-tree.gen.ts` from
`src/routes/`; commit that file but do not edit it manually.

Run browser tests against a completed production build:

```sh
pnpm exec playwright install chromium
pnpm run build
pnpm run test:browser
```

Do not rebuild `dist/` while browser tests are running. To use an existing Chrome
installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path.

Browser tests build a separate Pages variant in ignored `.test-pages/audio-sort/` and serve
it alongside `dist/`. They cover root and `/audio-sort/` URLs, workers, editor behavior,
and UI controls. External services are stubbed; audible output and remote soundfonts
need manual testing. Known bugs are tracked in [TODO](todo.md).

## Deployment

GitHub Actions runs checks and browser tests for PRs and before deployment.
CI uses the latest Node.js LTS release. Check/build jobs have a 10-minute timeout;
the deployment job has a 5-minute timeout.
After checks, CI rebuilds `dist/` with the `/audio-sort/` base and publishes it.
The repository's Pages
publishing source must be **GitHub Actions**.

## Reference

- [Modernization plan](modernization.md)

- [Architecture](architecture.md)
- [Adding algorithms](adding-algorithms.md)
