# Migration handoff

## Decisions

- Framework migration first; preserve the top/data and bottom/sort design.
- Complete React/Tailwind and remove Bootstrap/jQuery together in PR #47.
- No temporary compatibility overrides or interim Bootstrap migration.
- Keep sorting algorithms, recording API, Jotai state, and audio engine intact.
- TanStack Start follows in a separate PR. Redesign and license reporting are deferred.
- `ui-design.md` and `ui-prototype.html` are exploratory reference, not implementation targets.

## Completed UI migration

PR #47 migrated the whole workspace; PR #48 polished icons, hover states, and typography:

- The workspace uses a reusable vanilla Jotai store.
- `ui/workspace.tsx` assembles settings, playback controls, and native dialogs.
- `ui/create-workspace.mjs` owns worker/data coordination and audio subscriptions.
- `ui/create-workspace-player.mjs` bridges the existing transport/audio modules and D3.
- React owns controls; D3 owns SVG children; audio draws the waveform canvas.
- Settings/algorithm overrides stay in Jotai. Playback snapshots use `useSyncExternalStore`.
- Native ranges replace plugin sliders; native dialogs handle editing and MIDI export.
- Lazy Ace loading, invalid-source errors, focus restoration, cached-page suspension,
  worker fallback, MIDI export, and teardown/remount remain covered by browser tests.
- Bootstrap, jQuery, the legacy controller/player factories, old pane/modal templates,
  and `public/js` files are removed. Tailwind Preflight is enabled; no overrides remain.
- `src/css/site.css` preserves the existing visual style without copied Bootstrap CSS.
- At widths >=980px and heights >=900px, both charts gain 40px.

All third-party JavaScript is imported from pnpm packages. Timbre remains pinned to
`14.11.25`, with Node-only dependencies excluded. Native sample loading replaces
the old JSONP/MP3 extensions. No new license-output logic is included.

## Current branch: tanstack-start-shell

Eleventy and Liquid are replaced by TanStack Start file routes and React pages.
The existing workspace, runtime, and visual design are retained.

- `src/routes/` defines the three pages; Start generates `src/route-tree.gen.ts`.
- `src/pages/site-document.tsx` renders the shared header/footer and document.
- `src/pages/home.tsx` dynamically imports `src/js/main.tsx` after hydration.
  It renders the workspace within Start's React root; runtime lifecycle cleanup
  handles navigation away, cached pages, and remounts. Audio/editor modules never
  execute during prerendering.
- Public routes are `/`, `/about`, and `/api`. Per the user's updated preference,
  no `.html` compatibility routes or rewrites are included. Internal links use
  TanStack navigation; static hosting may append a directory trailing slash.
- `vite.config.mjs` emits directory index HTML and client assets to `dist/`, and build-time
  server files to ignored `.tanstack/server/`. No server is deployed.
- Builds use an explicit base: `/` by default; the deployment workflow sets
  `VITE_BASE_PATH=/audio-sort/` and runs the same `build` command.
  Browser tests build `.test-pages/audio-sort/` separately and serve both using
  `sirv-cli`, with no custom preview configuration or SPA fallback. CI rebuilds
  for Pages before uploading `dist/`; timeouts remain.
- Prerendering uses Start's automatic route discovery, with no manual page list or
  per-page output configuration. Link crawling stays disabled because it duplicates
  base-prefixed URLs in the Pages build.
- Tests cover clean URLs/reloads, client navigation, no-JavaScript content,
  hydration errors, lazy-load recovery, and the existing workspace regressions.
- Adding Vite's raw-import types exposed an existing `getFunctionBody` signature
  mismatch; it now explicitly accepts the source strings it already handled.

## Next

Review this migration before starting phase 8 (recorded writes/auxiliary buffers
and Merge sort). Keep redesign and license reporting deferred. See
`modernization.md` for the overall sequence; no algorithm metadata-format change
or audio-engine rewrite is needed for this shell migration.

## Verification

- `pnpm run format && pnpm run check`
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm run test:browser`
- Browser suites exercise root and Pages paths. Never rebuild while they run.
- Review desktop/tablet/mobile layouts and audition waveform/soundfont playback.
- See `docs/architecture.md` for ownership and lifecycle details.
