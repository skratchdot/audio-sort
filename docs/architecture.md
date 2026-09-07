# Architecture

Modules in `src/js/` use lowercase, hyphen-separated filenames. `ui/` contains
React components and runtime/player modules, `sorting/` the engine and request handling, and
`sorting/algorithms/` only algorithm implementations. Generators, utilities,
MIDI support, and visualizations each have their own directory. The app entry,
worker entry, and vendor bridge stay at the top level.

TypeScript is introduced incrementally alongside `.mjs` modules. Vite handles
bundling; `pnpm run typecheck` checks `.ts` and `.tsx` application modules separately.
Built-in algorithm source and the Ace editor remain JavaScript for now.

Generator implementations live in `generators/patterns/`; visualization
implementations live in `visualizations/renderers/`. Their named registries sit
one level above, separate from the implementations they register.

## UI

[`main.mjs`](../src/js/main.mjs) mounts one React workspace with an application-scoped
vanilla Jotai store. React owns settings, tabs, transport controls, counters, native
range inputs, and dialogs. Components are split into settings, waveform, playback,
and dialog modules under `ui/`. Tailwind Preflight/utilities and first-party
`site.css` preserve the two-section design; no Bootstrap or jQuery is shipped.

[`create-workspace.mjs`](../src/js/ui/create-workspace.mjs) coordinates workers,
data generation, settings subscriptions, soundfont preloading, and player lifetime.
React reads its playback snapshots through `useSyncExternalStore`. Settings and
custom algorithms are read directly from Jotai; there is no mirrored settings cache.
Audio clocks and nodes remain outside React and Jotai.

[`create-workspace-player.mjs`](../src/js/ui/create-workspace-player.mjs) owns
the contents of its D3 SVG and delegates transport and synthesis to
`audio/create-transport.ts` and `audio/create-timbre-audio.mjs`.
React renders the surrounding controls and an empty SVG host, never chart children.
The waveform preview canvas has the same explicit imperative ownership.
Pointer capture supports dragging input values across data updates.

Each waveform uses one shared envelope from `state/envelope.ts`. Defaults remain
attack 50 ms, decay 300 ms, sustain 50%, hold 200 ms, and release 300 ms.
Timbre's `adshr` holds at sustain level after decay; the envelope diagram uses that
ordering. The string preview is illustrative, not a sampled live waveform.

Native `dialog` elements provide modal focus containment and Escape handling.
Closing restores focus to the trigger. Ace loads on demand from its pnpm package;
closing a dialog invalidates pending initialization and destroys the editor/session.
The editor remains JavaScript with two-space soft tabs. Invalid edits leave the
catalog unchanged and show an error. MIDI export uses native selects, `jsmidgen`,
`file-saver`, and Blob.

Cached-page suspension disconnects runtime effects, pauses audio, cancels workers
and pending resumes, and closes dialogs. Returning reconnects effects without
automatically playing. React continues to represent the same Jotai store.
Non-cached exits and Vite disposal unmount React, dispose owned resources, and
release native pointer listeners. Fresh runtime instances can reuse the store.
The shared AudioContext stays library-owned.

All third-party JavaScript uses package imports. `vendor.mjs` only re-exports the
pinned Timbre browser entry; there are no classic script tags or `public/js` files.
D3 imports remain scoped. Sample audio is fetched and decoded by first-party
modules; see [the audio boundary](audio-dependencies.md).

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
