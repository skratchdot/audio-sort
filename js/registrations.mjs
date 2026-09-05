// Bootstraps are loaded by main.mjs before this module's dependencies execute.
// Algorithms use an explicit module registry; other registrations remain legacy.
import.meta.glob(["./fn/fn.*.js", "./visualization/visualization.*.js"], {
  eager: true,
});
