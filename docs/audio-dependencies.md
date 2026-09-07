# Audio boundary and dependency audit

## Current boundary

`audio/create-transport.ts` owns position, direction, looping, clock lifetime,
and invalidation of pending audio-resume actions. Its clock and effects are
injected; it has no DOM, Jotai, or Timbre dependency. Stop allows existing note
tails to finish; suspend/dispose silence owned waveform nodes. Empty data does
not start playback.

`audio/create-timbre-audio.mjs` adapts the existing engine: interval creation,
ADSHR and oscillator/pluck nodes, MIDI note triggers, gain, preview plotting,
and node disposal. It accepts the engine and settings getters as dependencies.
The player factory now connects those modules to sliders, buttons, and D3.
`audio/create-soundfont.ts` now owns a controller-scoped sample cache shared by
both players. `audio/create-timbre-soundfont.mjs` decodes fetched MP3s with the
existing AudioContext and feeds stereo buffers into the existing Timbre mixer.
No remote code is executed. Instrument selection is synchronized from settings;
audio buffers and pending requests remain outside Jotai.

Cache misses fetch without playing late (the former `play(note, false)` behavior).
Concurrent requests are deduplicated, failed requests can retry, and fetches have
a ten-second abort timeout. Suspension pauses cached sample nodes; destruction
aborts pending requests, releases nodes, and ignores late decoder results.

The JSONP, MP3 decoder, and soundfont vendor scripts are removed. The implementation
is first-party code, not a relocated vendor bundle. The remote GeneralUser GS bank
and numeric instrument/note mapping are unchanged. Native decoding may differ in
encoder-padding handling from the old JS decoder; listening review is still required.

Verification includes deterministic fetch/decode/cache tests, real browser stereo
buffer playback using a generated fixture, and a manual Chrome network/decode smoke
check of notes 60 for instruments 0, 42, and 127. The real host returned HTTP 200,
allowed CORS, and all three MP3s decoded as stereo at 44100 Hz on 2026-09-07.

## Packaged Timbre

The app imports `timbre/timbre.dev.js` from pinned `timbre@14.11.25`, not the
package's Node entry. pnpm overrides exclude its unused `speaker` and
`readable-stream` dependencies, avoiding native Node audio installation.
Vite maps the bundle's CommonJS `global` reference to `globalThis`. The package
still publishes a legacy global as a side effect; application consumers use the
imported value rather than reading that global.

The actual deployed minified bundle identified itself as `14.06.23`; the old
development file was `13.05.03` and was not its matching source. This migration
is therefore an explicit upgrade, not a claim of byte-for-byte equivalence.
All seven oscillator preview blocks matched the old deployed bundle. Deterministic
ADSHR and seeded pluck output matched over 700 processing blocks; regression
fingerprints preserve those checks without keeping a vendored baseline.
The published browser entry supports standard AudioContext, and production
browser tests exercise native stereo samples, playback controls, and teardown.
Listening review is still required for behavior beyond those checks.

Third-party attribution is deferred to a separate, project-wide changeset.
Local Timbre bundles, the stale map, and the Flash fallback asset are removed. The site
requires Web Audio; Flash-only browsers are no longer supported.

## Initial audit (2026-09-07, before the migrations)

These historical findings motivated the native loader and package migration above.

| Component                    | Evidence and compatibility concerns                                                                                                                                                                                                                                     | Next action                                                                                                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Timbre                       | The checked-in development bundle identifies itself as `13.05.03`. The npm registry reports `timbre@14.11.25`, whose main is `timbre.node.js`, with `speaker` and `readable-stream` dependencies and no browser override reported. This is not a proven drop-in import. | Inspect the published browser artifact and compare it with the deployed bundle, including local AudioContext changes, before adding a pinned dependency. Verify ADSHR, all eight generators, interval timing, and extensions. |
| Soundfont extension          | The local header attributes MIT-licensed code to skratchdot. It attaches to Timbre and uses per-note JSONP URLs on `projects.skratchdot.com/free-midi`. Registry lookup for the exact name `timbre.soundfont.js` returns 404.                                           | Prefer a focused first-party sample-loader adapter if no compatible published artifact is found; preserve instrument/note mapping and sample source first.                                                                    |
| audio-jsonp                  | The local source registers `audio.jsonp`, installs global callbacks, injects remote scripts, and decodes base64 via Timbre internals. Exact npm name `audio-jsonp` returns 404.                                                                                         | Replace alongside the soundfont loader, not independently. Check CORS on actual MP3 assets before choosing fetch/decodeAudioData.                                                                                             |
| MP3 decoder extension        | A bundled decoder extends the old engine. Exact npm name `timbre.mp3_decode` returns 404. Its transitive code/license inventory has not yet been completed.                                                                                                             | Verify browser-native decoding and the sample-loading path before removing it. Do not copy the bundle into source and call it first-party.                                                                                    |
| Development bundle/map/Flash | The footer loads only `timbre.js`, but it references its source map and contains a conditional `timbre.swf` fallback. Documentation currently links the development source for envelope semantics.                                                                      | Remove these only with an explicit browser-support decision and updated source references.                                                                                                                                    |

Registry checks identify specific package names, not proof that no alternative
package exists. The comparison above supersedes the initial packaging blockers.

Primary references:

- [Timbre package metadata](https://registry.npmjs.org/timbre/14.11.25)
- [Timbre source](https://github.com/mohayonao/timbre.js)
- [audio.jsonp documentation](https://projects.skratchdot.com/timbre.js/audiojsonp.html)
- [Soundfont extension source](https://github.com/skratchdot/timbre.soundfont.js)
- [Current sample collection](https://skratchdot.com/projects/free-midi/)

## Listening review and future changes

No audio-engine rewrite is required for the React migration. Native sample
loading no longer depends on the old decoder extensions, reducing coupling.
Do not change the sample bank silently: another soundfont library's defaults can
change every instrument's sound. Keep synthesis replacement separate from React.
Audition waveform and soundfont modes, envelope edits, instrument changes,
tempo/volume changes, forward/reverse/loop playback, and suspension on real audio.
Automated lifecycle tests are not a substitute for that listening review.
