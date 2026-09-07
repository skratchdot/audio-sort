# Architecture

Modules in `src/js/` use lowercase, hyphen-separated filenames. `ui/` contains
controller/player factories, `sorting/` the engine and request handling, and
`sorting/algorithms/` only algorithm implementations. Generators, utilities,
MIDI support, and visualizations each have their own directory. The app entry,
worker entry, and vendor bridge stay at the top level.

TypeScript is introduced incrementally alongside `.mjs` modules. Vite handles
bundling; `pnpm run typecheck` checks `.ts` application modules separately.
Built-in algorithm source and the Ace editor remain JavaScript for now.

Generator implementations live in `generators/patterns/`; visualization
implementations live in `visualizations/renderers/`. Their named registries sit
one level above, separate from the implementations they register.

## UI

[`main.mjs`](../src/js/main.mjs) creates the sort controller and supplies the data
generator registry. The controller passes its settings API to helper and player
factories. Visualizations are registered in
[`visualization-registry.mjs`](../src/js/visualizations/visualization-registry.mjs).

Selected settings live in [`state/settings.ts`](../src/js/state/settings.ts), using
`jotai/vanilla` without React. Each controller owns a separate store unless one
is supplied. UI handlers write through `updateSettingAtom`; helpers and players
read fresh values through the existing controller getters. There is no mirrored
settings object. Snapshots and defaults are immutable. Per-waveform envelope edits
live in [`state/waveforms.ts`](../src/js/state/waveforms.ts) in the same store;
generator presets stay fixed, and sustain edits retain two-decimal rounding.

This is a state-storage migration, not a reactive UI rewrite: existing handlers
still update DOM controls and audio resources. Writing directly to an injected
store does not yet synchronize those side effects. Player-local toggles remain
for subsequent steps.

[`vendor.mjs`](../src/js/vendor.mjs) captures globals from the classic scripts in
the footer, which must load before the module entry. The UI uses jQuery plugins,
timbre. Visualizations use named imports from pinned `d3-selection`, `d3-array`,
`d3-scale`, `d3-color`, and `d3-shape` packages, with explicit data joins and no D3 global.
MIDI export and downloads import pinned `jsmidgen` and
`file-saver` packages and use the browser's native Blob implementation.
Ace is imported from the pinned `ace-builds` npm package, with its
JavaScript mode, Monokai theme, and diagnostics worker bundled by Vite. The editor uses
two-space soft tabs and preserves source text without a separate beautifier.
It targets fixed DOM IDs and has no multi-mount or teardown
lifecycle. Data generators and utilities are modules with explicit imports;
[`generator-registry.ts`](../src/js/generators/generator-registry.ts) supplies the controller's generator catalog.

Musical scales are immutable local data in `src/js/midi/scales.ts`, extracted
from the former subcollider.js bundle with its MIT notice. Scale grouping and
note mapping retain the original behavior, including 24- and 43-pitch octave
groups; no subcollider global or prototype extensions are loaded.

## Engine and workers

[`create-sort-engine.ts`](../src/js/sorting/create-sort-engine.ts) exports `createSortEngine()`. Each default sort request
gets a fresh engine so recorded frames, counters, and custom API changes do not
leak between requests. `engine.init()` resets recording state, but does not undo
changes to engine methods when deliberately reusing an instance.

[`sort-types.ts`](../src/js/sorting/sort-types.ts) defines items, frames, the
algorithm-facing API, and request/response contracts. Operations accept indices
or item references; callers remain responsible for valid indices. The recorder
preserves the legacy extra terminal frame for nonempty sorts.

[`sort-requests.ts`](../src/js/sorting/sort-requests.ts) handles two message types:

- Built-in: `{ key, type: "builtin", id, arr }` runs an imported algorithm.
- Custom: `{ key, type: "custom", source, arr }` compiles an editor body with
  `Function("AS", source)`.

Replies contain `{ key, frames }` or `{ key, error }`. Without Worker support, the
UI uses the same request handler on the main thread. Custom code is arbitrary
JavaScript, not a security sandbox.

## Algorithms and editor source

[`algorithm-registry.mjs`](../src/js/sorting/algorithm-registry.mjs) holds immutable built-in functions and
metadata. [`state/algorithm-overrides.ts`](../src/js/state/algorithm-overrides.ts)
stores edits and additions per application store and derives a combined catalog.
Built-in identities stay intact until overridden; invalid source is compiled
before any state update. Duplicate IDs are rejected rather than replacing an
existing entry. Function metadata and editor source format are unchanged.
[`algorithm-sources.mjs`](../src/js/sorting/algorithm-sources.mjs) imports raw source separately so the
editor shows readable code without including those strings in the worker bundle.
Saving an edit creates a custom override and preserves its display metadata.

See [Adding algorithms](adding-algorithms.md) for registration and editor constraints.
