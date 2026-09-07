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
settings object. Snapshots and defaults are immutable. One shared envelope lives
in [`state/envelope.ts`](../src/js/state/envelope.ts); changing waveform only
selects a generator from [`state/waveforms.ts`](../src/js/state/waveforms.ts).
All waveforms, including string, start with attack 50 ms, decay 300 ms, sustain
50%, hold 200 ms, and release 300 ms. Sustain edits retain two-decimal rounding.

Timbre's bundled `adshr` implementation holds **at sustain level after decay**,
not at the peak before decay (see `register("adshr")` in
the pinned `timbre/timbre.dev.js` package entry). The native envelope controls and
[`envelope-diagram.ts`](../src/js/ui/envelope-diagram.ts) use that same ordering.
The diagram shows amplitude against proportional elapsed time; it is an envelope
preview, not the resulting oscillator or plucked-string signal.

[`connect-playback-settings.ts`](../src/js/ui/connect-playback-settings.ts) connects
volume, tempo, AutoPlay, and loop preferences to UI/audio effects. It applies
current values immediately, observes relevant changes, and returns a disconnect
function. The controller replaces its old connections before reconnecting.
[`connect-audio-settings.ts`](../src/js/ui/connect-audio-settings.ts) shares that
lifecycle and synchronizes audio type, waveform/envelopes, center note, scale,
and instrument. It sets the instrument before soundfont preloading and avoids
rebuilding generators for unrelated settings.
Envelope labels now populate on initial connection.
[`connect-sort-settings.ts`](../src/js/ui/connect-sort-settings.ts) renders the
catalog/selection and data size, resizes data before sorting, and reruns the
selected algorithm when its implementation changes. Adding or editing an
unselected algorithm updates the catalog without unnecessary sorting.
AutoPlay and each player's
loop preference live in `state/playback-preferences.ts`; their handlers render
button state from the store instead of reading CSS classes. AutoPlay no longer
uses Bootstrap's button toggle. Playing/stopped state, direction, position,
timers, and audio nodes remain outside the store. The player delegates position,
direction, looping, and clock lifetime to `audio/create-transport.ts`, and synthesis
and note dispatch to `audio/create-timbre-audio.mjs`. These modules do not own DOM
elements. See the [audio boundary and dependency audit](audio-dependencies.md).

Controllers are single-use: `init()` rejects repeated initialization; `destroy()`
is idempotent. Destruction disconnects subscriptions, cancels the sort worker and
click debounce, invalidates pending editor loads and audio-resume callbacks,
destroys the Ace editor/session, releases player audio nodes, and removes owned
sliders and namespaced events. Slider disposal also removes active document drag
handlers without disturbing unrelated handlers. Bar pointer state is per renderer
and survives data updates during a drag.

Cached-page `pagehide` suspends playback and subscriptions, cancels pending sorts,
and closes dialogs while keeping data/settings. Cached `pageshow` reconnects and
re-sorts without automatically resuming audio. Non-cached exits and Vite disposal
destroy the controller. A new controller can mount the existing markup and store;
simultaneous controllers sharing the same fixed DOM IDs are not supported.
Soundfont caches are controller-owned: suspension pauses samples, while destruction
aborts pending requests and releases sample nodes. The first-party loader fetches
the existing MP3 samples and uses native decoding instead of JSONP. Global vendor
libraries remain library-owned; teardown does not shut down the shared AudioContext.

[`vendor.mjs`](../src/js/vendor.mjs) captures globals from the classic scripts in
the footer, which must load before the module entry. The UI uses jQuery plugins,
timbre. Visualizations use named imports from pinned `d3-selection`, `d3-array`,
`d3-scale`, `d3-color`, and `d3-shape` packages, with explicit data joins and no D3 global.
MIDI export and downloads import pinned `jsmidgen` and
`file-saver` packages and use the browser's native Blob implementation.
Ace is imported from the pinned `ace-builds` npm package, with its
JavaScript mode, Monokai theme, and diagnostics worker bundled by Vite. The editor uses
two-space soft tabs and preserves source text without a separate beautifier.
It targets fixed DOM IDs and is destroyed with its owning controller.
Data generators and utilities are modules with explicit imports;
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
