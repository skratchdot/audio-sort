# Architecture

## UI

[`main.mjs`](../src/js/main.mjs) creates the sort controller and supplies the data
generator registry. The controller passes its settings API to helper and player
factories. Visualizations are registered in
[`visualization/registry.mjs`](../src/js/visualization/registry.mjs).

[`vendor.mjs`](../src/js/vendor.mjs) captures globals from the classic scripts in
the footer, which must load before the module entry. The UI uses jQuery plugins,
timbre, D3 v3, and Ace. It targets fixed DOM IDs and has no multi-mount or teardown
lifecycle. Data generators and utilities are modules with explicit imports;
[`fn/registry.mjs`](../src/js/fn/registry.mjs) supplies the controller's generator catalog.

## Engine and workers

[`AS.mjs`](../src/js/AS.mjs) exports `createSortEngine()`. Each default sort request
gets a fresh engine so recorded frames, counters, and custom API changes do not
leak between requests. `engine.init()` resets recording state, but does not undo
changes to engine methods when deliberately reusing an instance.

[`requests.mjs`](../src/js/sort/requests.mjs) handles two message types:

- Built-in: `{ key, type: "builtin", id, arr }` runs an imported algorithm.
- Custom: `{ key, type: "custom", source, arr }` compiles an editor body with
  `Function("AS", source)`.

Replies contain `{ key, frames }` or `{ key, error }`. Without Worker support, the
UI uses the same request handler on the main thread. Custom code is arbitrary
JavaScript, not a security sandbox.

## Algorithms and editor source

[`registry.mjs`](../src/js/sort/registry.mjs) holds immutable built-in functions and
metadata. The UI keeps its own mutable catalog for edits and additions.
[`sources.mjs`](../src/js/sort/sources.mjs) imports raw source separately so the
editor shows readable code without including those strings in the worker bundle.
Saving an edit creates a custom override and preserves its display metadata.

See [Adding algorithms](adding-algorithms.md) for registration and editor constraints.
