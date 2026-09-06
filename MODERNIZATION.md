# Modernization handoff

## Completed

- Eleventy replaces Jekyll; GitHub Actions checks PRs and deploys main to Pages.
- Oxlint, Oxfmt, Vitest, and Playwright guard changes.
- Vite replaces Grunt; generated `dist` is untracked and `_site` is built in CI.
- Built-ins use an immutable ES-module registry and ID-based worker requests.
- Custom/edited code retains readable source and receives `AS` explicitly.
- The engine is an isolated ES-module factory, fresh per default request.
- UI controller, player, helper, MIDI export, instruments, and visualizations are
  modules. Global `A`, `sort`, `AS`, and `visualization` are gone.

## Important boundaries

- `js/main.mjs` composes the app; the remaining `globalThis.fn.datagen` registry
  is injected into `createSortController`.
- `js/vendor.mjs` captures globals from unchanged classic vendor scripts. Keep
  those scripts loaded before the module entry. This is not a jQuery replacement.
- Controller settings are passed to helper/player factories; do not introduce
  controller/player/helper circular imports.
- UI still uses fixed DOM IDs, jQuery events/plugins, legacy timbre audio, D3 v3,
  and Ace. There is no multi-mount or teardown lifecycle yet.
- Worker messages and algorithm registration steps are documented in README.
- Editable algorithm bodies must stay self-contained. Custom code is arbitrary
  JavaScript, not sandboxed. Registry metadata remains separate from custom edits.
- Bootstrap 2 CSS remains unminified because of legacy IE syntax.
- Quick's incorrect stability metadata remains one expected-failure test; frame
  recording quirks and shared bar-pointer state have not been redesigned.

## Verification

Run `npm run check`, then `npm run test:browser` against that completed build.
Do not rebuild `_site` while browser checks are running. CI uses Node 24 and
Playwright Chromium; local checks can use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
Browser checks cover `/` and `/audio-sort/`, worker protocols, editor round trips,
fallback execution, UI controls, playback progress, and MIDI export. External
services are stubbed; audible fidelity and remote soundfonts need manual testing.

## Re-plan here before more implementation

The module boundary work is a good stopping point. Choose the next priority:

1. **More algorithms:** add a focused algorithm PR using the documented registry
   and source-map entries; fix Quick's metadata separately. Feature work need not
   wait for jQuery removal.
2. **Finish first-party module conversion:** convert generators/utilities and
   remove their bootstrap/glob registry and remaining VM source loaders.
3. **Reduce jQuery incrementally:** start with chooser/filter rendering and event
   handlers, add regression tests, then tackle dialogs/sliders separately.
4. **Audio reliability:** manually assess playback and soundfont support before
   choosing whether to retain, wrap, or replace timbre. Treat this as its own plan.

Avoid combining algorithm additions, audio-engine replacement, Bootstrap removal,
and a framework rewrite. Agree on a feature-vs-cleanup priority before proceeding.
