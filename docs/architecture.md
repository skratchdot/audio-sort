# Architecture

Modules in `src/` use lowercase, hyphen-separated filenames. `components/ui/` contains
shadcn Base UI primitives; `components/layout/` contains the header and footer.
`components/playground/` contains the interactive screen and its controls;
`components/dialogs/` contains the algorithm editor and MIDI export dialogs.
`sorting/` contains the engine and request handling, and
`sorting/algorithms/` only algorithm implementations. Generators,
MIDI support, and visualizations each have their own directory. The worker lives in
`sorting/worker.mjs`; the Timbre adapter lives in `audio/timbre.mjs`. `@/` aliases `src/`.

`utils/` contains small, stateless, domain-independent helpers: `cn.ts` combines
CSS classes; `random.ts`, `shuffle.ts`, and `swap.ts` handle numbers and arrays.
There is no separate `utilities/` folder or catch-all `utils.ts` file. shadcn's
`utils` alias points to `@/utils/cn` so newly generated components use the same helper.
Domain-specific code stays with its domain rather than accumulating in `utils/`.

The sorting playground is the interactive data/sort screen, including its editor
and playback controls. React presentation lives under `components/`;
`controllers/` connects the sorting, audio, state, and visualization modules. Shared
settings and atoms remain in `state/`; component-local state stays in its component. A player
is one data or sort panel; the playground coordinates both. The older “workspace”
name did not describe a separate domain concept.

TypeScript is introduced incrementally alongside `.mjs` modules. Vite handles
bundling; `pnpm run typecheck` checks `.ts` and `.tsx` application modules separately.
Built-in algorithm source and the Ace editor remain JavaScript for now.

Generator implementations live in `generators/patterns/`; visualization
implementations live in `visualizations/renderers/`. Their named registries sit
one level above, separate from the implementations they register.

## UI

TanStack Start routes in `src/routes/` contain Home, About, and API page content and use
the shared document in `src/components/layout/`. Public URLs are `/audio-sort/`, `/audio-sort/about`, and `/audio-sort/api`;
prerendering emits `index.html`, `about/index.html`, and `api/index.html`.
TanStack links provide client navigation and ordinary anchor fallbacks without
JavaScript. Audio and editor dependencies are dynamically imported by
Home's effect, never evaluated during server prerendering. About/API remain usable
without JavaScript. `src/client.tsx` hydrates the document.

[`browser-playground.tsx`](../src/components/playground/browser-playground.tsx) owns the browser playground lifecycle with an application-scoped
vanilla Jotai store. React owns settings, tabs, transport controls, counters,
sliders, and dialogs. Shared buttons, links, and option controls use Tailwind classes.
`styles/globals.css` holds the shadcn theme and document defaults;
`styles/visualizations.css` styles D3-owned SVG children. There is no `site.css`.
The light theme uses sky accents and neutral surfaces. Playground layout uses one
threshold (`lg`, 1024px): stacked below it, side-by-side above it. Chart heights
are fluid, bounded with `clamp()`, without height-specific media queries.

[`create-playground.mjs`](../src/controllers/create-playground.mjs) coordinates workers,
data generation, settings subscriptions, soundfont preloading, and player lifetime.
React reads its playback snapshots through `useSyncExternalStore`. Settings and
custom algorithms are read directly from Jotai; there is no mirrored settings cache.
Audio clocks and nodes remain outside React and Jotai.

[`create-player.mjs`](../src/controllers/create-player.mjs) owns
the contents of its D3 SVG and delegates transport and synthesis to
`audio/create-transport.ts` and `audio/create-timbre-audio.mjs`.
React renders the surrounding controls and an empty SVG host, never chart children.
The waveform preview canvas has the same explicit imperative ownership.
Pointer capture supports dragging input values across data updates.

Each waveform uses one shared envelope from `state/envelope.ts`. Defaults remain
attack 50 ms, decay 300 ms, sustain 50%, hold 200 ms, and release 300 ms.
Timbre's `adshr` holds at sustain level after decay; the envelope diagram uses that
ordering. The string preview is illustrative, not a sampled live waveform.

shadcn's Base UI dialogs provide modal focus containment and Escape handling.
Closing restores focus to the trigger. Ace loads on demand from its pnpm package;
closing a dialog invalidates pending initialization and destroys the editor/session.
The editor remains JavaScript with two-space soft tabs. Invalid edits leave the
catalog unchanged and show an error. Tab panels stay mounted to preserve the
editor and waveform canvas. Sliders use center-aligned thumbs so hidden-panel
initialization does not depend on measuring thumb widths. MIDI export uses shadcn native selects, `jsmidgen`,
`file-saver`, and Blob.

Cached-page suspension disconnects runtime effects, pauses audio, cancels workers
and pending resumes, and closes dialogs. Returning reconnects effects without
automatically playing. React continues to represent the same Jotai store.
Non-cached exits and Home effect cleanup unmount the playground, dispose owned resources, and
release native pointer listeners. Fresh runtime instances can reuse the store.
The shared AudioContext stays library-owned.

All third-party JavaScript uses package imports. `audio/timbre.mjs` only re-exports the
pinned Timbre browser entry; there are no classic script tags or `public/js` files.
D3 imports remain scoped. Sample audio is fetched and decoded by first-party
modules; see [the audio boundary](audio-dependencies.md).

## Engine and workers

[`create-sort-engine.ts`](../src/sorting/create-sort-engine.ts) exports `createSortEngine()`. Each default sort request
gets a fresh engine so recorded frames, counters, and custom API changes do not
leak between requests. `engine.init()` resets recording state, but does not undo
changes to engine methods when deliberately reusing an instance.

[`sort-types.ts`](../src/sorting/sort-types.ts) defines items, frames, the
algorithm-facing API, and request/response contracts. Operations accept indices
or item references; callers remain responsible for valid indices. The recorder
preserves the legacy extra terminal frame for nonempty sorts.

[`sort-requests.ts`](../src/sorting/sort-requests.ts) handles two message types:

- Built-in: `{ key, type: "builtin", id, arr }` runs an imported algorithm.
- Custom: `{ key, type: "custom", source, arr }` compiles an editor body with
  `Function("AS", source)`.

Replies contain `{ key, frames }` or `{ key, error }`. Without Worker support, the
UI uses the same request handler on the main thread. Custom code is arbitrary
JavaScript, not a security sandbox.

## Algorithms and editor source

[`algorithm-registry.mjs`](../src/sorting/algorithm-registry.mjs) holds immutable built-in functions and
metadata. [`state/algorithm-overrides.ts`](../src/state/algorithm-overrides.ts)
stores edits and additions per application store and derives a combined catalog.
Built-in identities stay intact until overridden; invalid source is compiled
before any state update. Duplicate IDs are rejected rather than replacing an
existing entry. Function metadata and editor source format are unchanged.
[`algorithm-sources.mjs`](../src/sorting/algorithm-sources.mjs) imports raw source separately so the
editor shows readable code without including those strings in the worker bundle.
Saving an edit creates a custom override and preserves its display metadata.

See [Adding algorithms](adding-algorithms.md) for registration and editor constraints.
