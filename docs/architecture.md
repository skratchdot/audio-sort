# Architecture

Modules in `src/js/` use lowercase, hyphen-separated filenames. `ui/` contains
controller/player factories, `sorting/` the engine and request handling, and
`sorting/algorithms/` only algorithm implementations. Generators, utilities,
MIDI support, and visualizations each have their own directory. The app entry,
worker entry, and vendor bridge stay at the top level.

Generator implementations live in `generators/patterns/`; visualization
implementations live in `visualizations/renderers/`. Their named registries sit
one level above, separate from the implementations they register.

## UI

[`main.mjs`](../src/js/main.mjs) creates the sort controller and supplies the data
generator registry. The controller passes its settings API to helper and player
factories. Visualizations are registered in
[`visualization-registry.mjs`](../src/js/visualizations/visualization-registry.mjs).

[`vendor.mjs`](../src/js/vendor.mjs) captures globals from the classic scripts in
the footer, which must load before the module entry. The UI uses jQuery plugins,
timbre and D3 v3. Ace is imported from the pinned `ace-builds` npm package, with its
JavaScript mode, Monokai theme, and diagnostics worker bundled by Vite. The editor uses
two-space soft tabs and preserves source text without a separate beautifier.
It targets fixed DOM IDs and has no multi-mount or teardown
lifecycle. Data generators and utilities are modules with explicit imports;
[`generator-registry.mjs`](../src/js/generators/generator-registry.mjs) supplies the controller's generator catalog.

## Engine and workers

[`create-sort-engine.mjs`](../src/js/sorting/create-sort-engine.mjs) exports `createSortEngine()`. Each default sort request
gets a fresh engine so recorded frames, counters, and custom API changes do not
leak between requests. `engine.init()` resets recording state, but does not undo
changes to engine methods when deliberately reusing an instance.

[`sort-requests.mjs`](../src/js/sorting/sort-requests.mjs) handles two message types:

- Built-in: `{ key, type: "builtin", id, arr }` runs an imported algorithm.
- Custom: `{ key, type: "custom", source, arr }` compiles an editor body with
  `Function("AS", source)`.

Replies contain `{ key, frames }` or `{ key, error }`. Without Worker support, the
UI uses the same request handler on the main thread. Custom code is arbitrary
JavaScript, not a security sandbox.

## Algorithms and editor source

[`algorithm-registry.mjs`](../src/js/sorting/algorithm-registry.mjs) holds immutable built-in functions and
metadata. The UI keeps its own mutable catalog for edits and additions.
[`algorithm-sources.mjs`](../src/js/sorting/algorithm-sources.mjs) imports raw source separately so the
editor shows readable code without including those strings in the worker bundle.
Saving an edit creates a custom override and preserves its display metadata.

See [Adding algorithms](adding-algorithms.md) for registration and editor constraints.
