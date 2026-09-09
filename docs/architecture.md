# Architecture

See [development](development.md) for commands, publishing pages, and adding algorithms.

## Module map

Paths below are relative to `src/`; `@/` aliases that directory.

| Directory                                       | Responsibility                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `routes/`                                       | TanStack Start pages and the legacy `index.html` redirect                |
| `components/layout/`                            | Shared document, header, and footer                                      |
| `components/playground/`, `components/dialogs/` | Interactive controls, editor, and MIDI export                            |
| `components/ui/`                                | Shared shadcn Base UI primitives                                         |
| `components/visualizations/`                    | React SVG charts and envelope diagram                                    |
| `controllers/`                                  | Playground/player coordination and settings connections                  |
| `state/`                                        | Jotai settings, envelopes, playback preferences, and algorithm overrides |
| `sorting/`                                      | Recorder, worker protocol, registries, and algorithm implementations     |
| `generators/`, `midi/`                          | Input patterns, musical data, and MIDI encoding                          |
| `audio/`                                        | Playback transport, synthesis, and sample loading                        |
| `visualizations/`                               | Pure trajectory geometry and visualization types                         |
| `utilities/`                                    | Stateless helpers for arrays, randomness, and CSS classes                |

TypeScript and JavaScript coexist. Built-in algorithms and editable function bodies
remain JavaScript. Third-party JavaScript comes from package imports.

## UI and lifecycle

Home imports `components/playground/browser-playground.tsx` after hydration.
About/API import Markdown from `docs/` through `components/docs-page.tsx` and
remain readable without JavaScript. Browser audio and editor modules do not run
during prerendering.

`controllers/create-playground.mjs` coordinates data generation, workers, settings
connections, sample preloading, and two players. Each player publishes frames,
position, and visualization selection. React reads runtime snapshots through
`useSyncExternalStore` and settings through the application-scoped Jotai store.
Audio clocks, nodes, and sample caches stay outside React and Jotai.

React owns SVG children; D3 supplies array, scale, color, and path utilities.
Trajectory geometry is memoized by frame data. The waveform preview canvas is
drawn imperatively. Layout stacks below `lg` (1024px) and uses side-by-side panels
above it; chart heights use `clamp()`.

Base UI handles dialog focus and dismissal. Ace loads on demand, with pending
initialization cancelled on close. Tab panels stay mounted for editor/canvas
lifetime. Invalid source leaves the algorithm catalog unchanged.

Cached-page suspension disconnects effects, pauses audio, cancels workers and
pending resumes, and closes dialogs. Returning reconnects without automatically playing.
Leaving Home disposes the playground and its owned resources. The shared
AudioContext remains library-owned.

## Sorting and editor source

`sorting/create-sort-engine.ts` records item snapshots, markers, comparisons, and
swaps. Each default request gets a fresh engine. `init()` resets recording state,
but does not restore methods changed by custom code on a reused engine.
Operations accept indexes or item references; callers must supply valid indexes.
Nonempty recordings retain a legacy extra terminal frame.

`sorting/sort-requests.ts` handles built-in requests by registry ID and custom
requests by compiling a function body with `Function("AS", source)`. Replies
contain `{ key, frames }` or `{ key, error }`. Without Worker support, the same
handler runs on the main thread. Custom JavaScript has no security sandbox, and the
worker does not impose an execution or frame budget.

`sorting/algorithm-registry.mjs` holds frozen built-ins. Jotai stores custom
additions and overrides separately and derives the combined catalog. Source is
compiled before updating state; duplicate IDs are rejected.
`sorting/algorithm-sources.mjs` imports readable source separately for the editor,
so source strings are not included in the worker bundle.

## Audio

`audio/create-transport.ts` owns timing, position, direction, looping, and pending
resume invalidation. Its clock and effects are injected. Stop allows note tails
to finish; suspension/disposal silences owned nodes.
`audio/create-timbre-audio.mjs` connects transport events to synthesis and previews.
Waveforms share the envelope in `state/envelope.ts`; the string preview is
illustrative rather than a sampled live waveform.

`audio/create-soundfont.ts` shares a sample cache between both players, deduplicates
requests, allows retries, and aborts fetches after ten seconds. Cache misses load
without playing a late note. `audio/create-timbre-soundfont.mjs` decodes MP3s with
the existing AudioContext and feeds buffers to Timbre. Disposal aborts requests
and ignores late results. The GeneralUser GS sample bank and instrument/note
mapping were retained during modernization.

`audio/timbre.mjs` imports `timbre/timbre.dev.js`, not its Node entry.
`pnpm-workspace.yaml` excludes unused `speaker` and `readable-stream` dependencies;
Vite maps the bundle's CommonJS `global` to `globalThis`. Timbre publishes a global
as a side effect, but application code uses its import. `package.json` permits
compatible updates; the lockfile currently resolves Timbre to `14.11.25`.

The migration replaced deployed Timbre `14.06.23` (whose old development file was
`13.05.03`) and removed JSONP, JavaScript MP3 decoding, and the Flash fallback.
Regression tests preserve oscillator/envelope/pluck fingerprints and exercise
sample caching and native decoding. The original audit recorded successful CORS
fetches and stereo decoding for note 60, instruments 0, 42, and 127 on 2026-09-07;
that is historical evidence, not a current availability check.

For audio changes, audition waveform and soundfont modes, envelope edits,
instrument changes, tempo/volume, forward/reverse/loop playback, and suspension.
Automated tests do not establish audible equivalence, especially around decoder
padding. Changing the sample bank can change every instrument's sound. Remaining
listening and attribution work is tracked in [TODO](todo.md).
