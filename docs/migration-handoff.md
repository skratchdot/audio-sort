# Migration handoff

## User decisions

- Framework migration first: React, Tailwind, TanStack Start. No redesign yet.
- Preserve the current top/data and bottom/sort sections and all functionality.
- Slightly increase chart height where laptops have spare vertical space.
- Keep sorting algorithms, recording API, audio engine, and Jotai state intact.
- Larger cohesive changesets; no interim Bootstrap 5 migration.
- Third-party license reporting is deferred to its own project-wide task.
- Commit/PR when requested; do not assume every implementation turn should publish.

## Baseline

PRs through #46 are merged. Audio is isolated into typed transport and a Timbre
adapter; native soundfont loading replaces JSONP/MP3 extensions. Timbre is imported
from pinned `14.11.25`; only jQuery, Bootstrap, and bootstrap-slider remain vendored.
Source is in `src/`, output in `dist/`. pnpm; strict TypeScript for `.ts`/`.tsx`;
oxlint/oxfmt JSON config; GitHub Pages and PR workflows have timeouts.

## Current changeset: react-tailwind-foundation

- React and Tailwind Vite integration added to the existing Eleventy build.
- Tailwind uses `tw:` prefix, with no Preflight during Bootstrap coexistence.
- `src/js/ui/waveform-controls.tsx` owns waveform buttons, envelope ranges, and
  the envelope diagram. Uses the supplied vanilla Jotai store; no mirrored state.
- `create-sort-controller.mjs` mounts the island synchronously before players
  need its canvas, and unmounts on teardown. Removed corresponding jQuery UI code.
- Canvas drawing remains imperative and audio-owned; SVG envelope drawing has
  a dedicated React-owned host. No React ownership of D3 chart children yet.
- At widths >=980px and heights >=900px, both charts gain 40px. Short screens
  and mobile retain the previous chart sizes and overall design.
- `docs/ui-design.md` and `ui-prototype.html` are deferred exploration, not a target.

## Next changeset

Start the TanStack Start static shell while preserving the current layout. Use
React routes for Home/About/API. Keep browser-only audio/editor imports out of
server prerendering. A temporary isolated legacy workspace may be needed while
remaining controls migrate; never let React and jQuery mutate the same subtree.

Verify before replacing Eleventy: static `.html` URLs and direct reloads, root and
`/audio-sort/`, worker URLs, Ace chunks, public assets, no server needed in Pages,
and hydration/teardown. The current tests expect exact public build contents;
update those deliberately, not by relaxing checks broadly.

Then migrate the remaining settings, transports, and dialogs in a cohesive pass,
remove legacy controller/Bootstrap/jQuery, and only then revisit design/features.

## Verification commands

- `pnpm run format && pnpm run check`
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm run test:browser`
- Browser suites exercise root and Pages paths; do not rebuild while they run.
- Audition waveform/soundfont playback after lifecycle or audio changes.

## Official references checked

- [Start static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering): explicit per-page output paths and flat HTML output.
- [Start setup](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch): Vite plugin order, React root, router, and TypeScript.
- [Tailwind Preflight](https://tailwindcss.com/docs/preflight): import theme/utilities separately to omit reset.

These docs establish an approach, not a completed Start feasibility test. Start is
not installed yet. Re-read installed package APIs when implementing that migration.
