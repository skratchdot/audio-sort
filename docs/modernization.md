# Modernization plan

Deliver cohesive, substantial PRs in this order. Preserve sorting, playback, editable
algorithms, and static hosting throughout. Skip an interim Bootstrap 5 migration.

1. **TypeScript foundation.** Add strict, no-emit checking and migrate independent
   data/utilities first. Keep existing JavaScript working; expand type coverage
   incrementally rather than suppressing errors across the legacy controller.
2. **Finish independent TypeScript modules.** Type array utilities, generators,
   and their registry while preserving runtime behavior. Keep the current
   algorithm function/metadata format and JavaScript editor unchanged; a format
   redesign is deferred until it simplifies code or enables useful type checking.
3. **Typed recording API.** Type items, frames, and worker messages
   without changing recording semantics. Keep the factory unless a class solves
   a concrete problem; algorithms depend on an interface, not its implementation.
4. **Jotai settings.** Introduce an application-scoped vanilla store behind the
   current UI. Migrate settings and custom overrides to one source of truth.
   Static registries stay imports; derived atoms can combine them with overrides.
   Keep audio nodes, timers, workers, and editors outside the store.
5. **Playback boundary and audio dependencies.** Separate playback lifecycle and
   scheduling from DOM controls. Audit Timbre, soundfont and MP3 extensions, and
   audio-jsonp for package availability, local modifications, asset loading,
   licenses, and browser behavior. Use pinned package imports when compatible;
   otherwise plan a focused first-party replacement. Do not combine an audio
   engine rewrite with a UI rewrite. Listening checks remain part of review.
6. **React, Tailwind, and selected shadcn components.** Migrate settings, dialogs,
   editor, and player controls in independently owned DOM sections. Replace
   Bootstrap and its slider directly, then remove jQuery after its last consumer.
   Keep audio scheduling outside React and give D3 sole ownership inside its SVG
   container. Start with one primary responsive breakpoint and fluid layout.
7. **TanStack Start.** Replace Eleventy/Liquid after the React UI works. First do
   a small static-deployment feasibility check before committing to the UI shell.
   Preserve direct page URLs, root and /audio-sort/ paths, worker/assets, and
   GitHub Pages deployment. Browser-only dependencies must not run during
   prerendering. Keep existing workflow timeouts and checks.
8. **New recording capabilities.** Use Merge sort to design recorded writes and
   auxiliary buffers, including intermediate identity semantics and counters.
   Follow with counting/radix support; keep this separate from UI migrations.

## Dependency end state

No third-party JavaScript is served from `public/js/` or read from `globalThis`.
Dependencies come from pnpm package imports; application replacements live in
`src/js/`. Moving copied vendor scripts into `src/js/` is not a replacement.
Retain required attribution for adapted data/code. Package-managed assets such
as Ace workers may be emitted by the build; they are not manually vendored files.

The remaining vendored JavaScript is jQuery, Bootstrap, and bootstrap-slider.
Timbre is imported from its pinned package browser entry.
JSONP and the MP3/soundfont extensions have been replaced by first-party native
sample loading. The obsolete Timbre development bundle, source map, and Flash
fallback asset have also been removed.
Check external soundfont loading separately from local script packaging.

Completion requires no legacy script tags/vendor bridge, reproducible package
installs, and working editor, playback, MIDI export, and static-path checks.

## Current phase

TypeScript checks cover scales, instruments, all array utilities, generators,
the generator registry, sort recorder, and request/response handling.
Remaining `.mjs` modules and browser-entered algorithms are not type-checked yet.

Phase 4 is complete: selected settings, waveform envelopes, custom algorithm
overrides, AutoPlay, and looping use an application-scoped Jotai store. Disposable
connections synchronize audio controls, algorithm/catalog changes, and data size.
Controllers/players now have explicit suspension and teardown for subscriptions,
workers, timers, editors, owned audio nodes, sliders, and event handlers. Cached
pages preserve data/settings; remounting does not duplicate controls or listeners.

Phase 5 implementation is complete, pending listening review: playback position, direction, looping, scheduling, and
resume invalidation now live in a DOM-independent typed transport. A separate
audio adapter owns existing Timbre synthesis and note dispatch. The player factory
connects these to the legacy controls and visualizations.

Soundfont samples now use controller-owned caching, fetch, and native decoding,
while retaining the existing sample bank and Timbre mixer. The three legacy
JSONP/MP3/soundfont scripts are removed. The [audio dependency audit](audio-dependencies.md)
records sample-host verification and the Timbre package compatibility checks.
Timbre now uses the pinned `14.11.25` browser entry with its Node-only dependencies
excluded. The obsolete local bundles, map, and Flash asset are removed.
Next is phase 6: agree on the desired features and desktop/mobile layout before
implementing the React UI, retaining the existing sorting, state, and audio modules.
Keep transport state and shared vendor resources out of Jotai; retain listening checks.
The algorithm function/metadata format and editor remain unchanged; do not add parser/build
machinery solely to reorganize metadata.
