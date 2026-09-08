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

## Completed TanStack Start shell

Eleventy and Liquid are replaced by TanStack Start file routes and React pages.
The existing workspace, runtime, and visual design are retained.

- `src/routes/` defines the three pages; Start generates `src/route-tree.gen.ts`.
- `src/pages/site-document.tsx` renders the shared header/footer and document.
- `src/pages/home.tsx` dynamically imports `src/features/workspace/browser-workspace.tsx` after hydration.
  It renders the workspace within Start's React root; runtime lifecycle cleanup
  handles navigation away, cached pages, and remounts. Audio/editor modules never
  execute during prerendering.
- Public routes are `/audio-sort/`, `/audio-sort/about`, and `/audio-sort/api`. Per the user's updated preference,
  no `.html` compatibility routes or rewrites are included. Internal links use
  TanStack navigation; static hosting may append a directory trailing slash.
- `vite.config.ts` emits directory index HTML and client assets to `dist/audio-sort/`, and build-time
  server files to ignored `.tanstack/server/`. No server is deployed.
- Development, production, preview, and browser tests share `/audio-sort/`.
  There is one build and one browser suite. Preview serves `dist/` using `sirv-cli`,
  with no custom preview configuration or SPA fallback. CI uploads the tested
  `dist/audio-sort/` directory without rebuilding; timeouts remain.
- Prerendering uses Start's automatic route discovery, with no manual page list or
  per-page output configuration. Link crawling stays disabled because it duplicates
  base-prefixed URLs in the Pages build.
- Tests cover clean URLs/reloads, client navigation, no-JavaScript content,
  hydration errors, lazy-load recovery, and the existing workspace regressions.
- Adding Vite's raw-import types exposed an existing `getFunctionBody` signature
  mismatch; it now explicitly accepts the source strings it already handled.

## Next

The current `shadcn-base-ui` branch refines the UI without changing audio, state,
or sorting APIs. It uses shadcn's Base UI Nova primitives, retains Lucide and the
system font, and maps the light theme to Tailwind sky/neutral colors.

- `src/components/ui/`: shared primitives; `components/layout/`: header/footer.
- `src/features/workspace/`: components, separate dialogs, and runtime coordination.
- `src/styles/globals.css`: theme/document defaults; `visualizations.css`: D3 state styles.
- `site.css` and the `tw:` prefix are removed. Buttons and links own their Tailwind classes.
- Two workspace layouts use one 1024px threshold; chart heights are fluid.
- Tab panels stay mounted for Ace/canvas lifetime. Slider thumbs use center alignment
  to avoid hidden-panel measurement. Base UI handles dialog focus and dismissal.

Review this changeset visually and audition playback. Then continue phase 8
(recorded writes/auxiliary buffers and Merge sort). Redesign and license reporting remain deferred.

## Verification

- `pnpm run format && pnpm run check`
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm run test:browser`
- Browser tests exercise the shared `/audio-sort/` path. Never rebuild while they run.
- Review desktop/tablet/mobile layouts and audition waveform/soundfont playback.
- See `docs/architecture.md` for ownership and lifecycle details.
