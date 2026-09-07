# Adding algorithms

1. Add `src/js/sorting/algorithms/<id>.mjs`, following an existing algorithm's default
   function and metadata properties. Use its `AS` argument to record operations
   and animation frames; see the [engine API](../src/api.html).
2. Import and register the function under a stable ID in
   [`algorithm-registry.mjs`](../src/js/sorting/algorithm-registry.mjs).
3. Add a raw-source import and matching entry in
   [`algorithm-sources.mjs`](../src/js/sorting/algorithm-sources.mjs) for the editor.
4. Run `npm run check`, then `npm run test:browser`. See
   [Development](development.md) for browser setup.

Keep the function body self-contained: use `AS` and standard JavaScript, with
helpers declared inside the function. Imported helpers are not available when
the body is copied into the custom editor.

Tests discover `sorting/algorithms/*.mjs` files and check registry/source coverage, sorting
results, item preservation, frame counters, and metadata. Browser tests exercise
each built-in in a worker and after saving its source through the editor.
