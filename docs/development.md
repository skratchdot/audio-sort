# Development

Use Node.js 24+ and the pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:5173/audio-sort/`. Use `pnpm add` / `pnpm add -D` for
dependency changes and commit `pnpm-lock.yaml`.

## Build and deployment

`pnpm build` prerenders the site into `dist/audio-sort/`. `pnpm preview` serves
`dist/` with sirv at `http://localhost:8080/audio-sort/`, without server rendering
or an SPA fallback. Build-time server files stay in ignored `.tanstack/`.

Development, preview, tests, and deployment share the `/audio-sort/` base.
The public pages are Home, About, and API. About/API emit directory index files;
static hosts may append a trailing slash. The legacy `/audio-sort/index.html`
route redirects to Home in the router.

TanStack Start discovers static routes automatically. Link crawling is disabled
because it duplicates base-prefixed URLs in this build. Dynamic routes need
explicit URLs for prerendering. Start generates `src/route-tree.gen.ts`; commit it but
do not edit it manually.

Assets in `public/` are copied unchanged into the output, including `.nojekyll`.
For source CSS images, use `/img/...`; Vite adjusts those URLs for the site base.

GitHub Actions runs checks and browser tests for PRs and deployment. The Pages
workflow uploads the tested `dist/audio-sort/` without rebuilding. Set the
repository's Pages source to **GitHub Actions**. No Node server is deployed.

## Checks

| Command                                     | Purpose                                                               |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm run check`                            | Lint, formatting, spelling, types, unit tests, and production build   |
| `pnpm run lint`                             | Oxlint checks                                                         |
| `pnpm run format` / `pnpm run format:check` | Format files / check formatting                                       |
| `pnpm run spellcheck`                       | CSpell checks                                                         |
| `pnpm run typecheck`                        | Strict checking of application TypeScript; `.mjs` is not type-checked |
| `pnpm test` / `pnpm run test:watch`         | Node and Chromium hook tests / watch mode                             |

Vitest runs pure unit tests in Node and React hook tests in Chromium through its
Playwright provider. Install Chromium once with `pnpm exec playwright install chromium`
before running `pnpm test` or `pnpm run check`. To run only Node tests, use
`pnpm test --project=node`.

The separate Playwright suite tests the completed production build:

```sh
pnpm exec playwright install chromium
pnpm run build
pnpm run test:browser
```

Do not rebuild while browser tests run. To use installed Chrome, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path. Tests cover static
URLs, navigation without JavaScript, editing, workers, playback, and UI lifecycle.
External audio services are stubbed; audible output and the real sample host need
manual checks. See [audio maintenance](architecture.md#audio) and [TODO](todo.md).

CSpell configuration lives in `cspell.config.ts`. Add accepted vocabulary to
`.cspell/project.txt` or `.cspell/music.txt`, lowercase and alphabetized. Use narrow
config overrides for file-specific terms. Fix typos instead of broadly excluding
prose. The original scale catalog is excluded; its attribution stays in source.

## Markdown site pages

Edit [about.md](about.md) and [api.md](api.md) for the public pages.
`src/components/docs-page.tsx` supports headings, lists, links, fenced code, and
GitHub-style tables. Raw HTML is not rendered. Content is prerendered and readable
without JavaScript. API-specific rendering adds marker swatches.

To publish another document:

1. Add a Markdown file in `docs/` with one `#` page title.
2. Copy `src/routes/about.tsx`, change the route path and element ID, and import
   the document with Vite's `?raw` suffix. Set a descriptive table label if needed.
3. Add its filename and route to `documentRoutes` in `src/components/docs-page.tsx`.
4. Add a header link if it belongs in navigation. Update the browser test's page
   and navigation expectations when adding a route or link.

Use `/` for Home and `api.md` for another published document. Router links preserve
`/audio-sort/` and client navigation. Link unpublished development docs through
full repository URLs. Adding a file to `docs/` alone does not publish it.

## Adding algorithms

The [sorting catalog](sorting-algorithms.md) records candidates and implementation status.

1. Add `src/sorting/algorithms/<id>.mjs` with a default function and metadata,
   following an existing implementation. Use its `AS` argument; see the [API](api.md).
2. Register its stable ID in `src/sorting/algorithm-registry.ts`.
3. Add a raw-source import and entry in `src/sorting/algorithm-sources.ts`.
4. Update the catalog, then run `pnpm run check` and `pnpm run test:browser`.

Keep the function body self-contained: imported helpers are unavailable when the
body is copied into the editor. Declare helpers inside the function. Choose the
exact variant before assigning complexity and stability metadata.

Tests discover algorithm files and check registry/source coverage, sorting,
item preservation, counters, and metadata. Browser tests run each built-in in a
worker and after saving it through the editor.

## UI components

Add primitives with `pnpm dlx shadcn@latest add <component>`. `components.json`
selects Base UI, Nova, and Lucide. Theme defaults live in `src/styles/globals.css`;
components own their Tailwind classes. See [architecture](architecture.md) for
module ownership and the current layout.

## Accessibility

Oxlint enables `jsx-a11y` correctness rules. The semantic-tag preference is disabled
because SVG/canvas images and live regions legitimately use ARIA. Documentation
table regions retain keyboard focus for scrolling. Shared links and labels forward
content and associations explicitly so lint can inspect them.

The browser suite runs axe on Home, About, API, settings tabs, and editor/export
dialogs. Run just these checks with `pnpm run test:browser --grep 'accessibility:'`
after building. Tests check the rendered DOM, including generated ARIA references
that static lint cannot validate. Base UI owns tab-panel IDs; use `data-panel` for
stable test selectors rather than overriding those IDs.

For release review, also run Lighthouse on the production build and manually check
keyboard navigation, focus restoration, and screen-reader labels. A clean automated
audit does not establish complete accessibility.
