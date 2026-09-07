# Migration handoff

## Decisions

- Framework migration first; preserve the top/data and bottom/sort design.
- Complete React/Tailwind and remove Bootstrap/jQuery together in PR #47.
- No temporary compatibility overrides or interim Bootstrap migration.
- Keep sorting algorithms, recording API, Jotai state, and audio engine intact.
- TanStack Start follows in a separate PR. Redesign and license reporting are deferred.
- `ui-design.md` and `ui-prototype.html` are exploratory reference, not implementation targets.

## Current branch: react-tailwind-foundation

PR #47 has been expanded from the initial waveform island to the whole workspace:

- `main.mjs` mounts React with a reusable vanilla Jotai store.
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

## Next: TanStack Start

Replace the Eleventy/Liquid shell with React Home/About/API routes and a static
build, preserving the current layout. Keep browser-only audio/editor dependencies
out of server prerendering. Do not rewrite the runtime or redesign the workspace.

Prove static `.html` URLs/direct reloads, root and `/audio-sort/`, worker/Ace URLs,
public assets, hydration/unmount, and GitHub Pages without a server. Update exact
production-output assertions deliberately. Preserve workflow timeouts.

Start is not installed yet. The official
[static prerendering guide](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)
and [setup guide](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)
were reviewed for the approach; recheck installed APIs during implementation.

## Verification

- `pnpm run format && pnpm run check`
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm run test:browser`
- Browser suites exercise root and Pages paths. Never rebuild while they run.
- Review desktop/tablet/mobile layouts and audition waveform/soundfont playback.
- See `docs/architecture.md` for ownership and lifecycle details.
