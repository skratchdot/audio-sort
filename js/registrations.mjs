// Bootstraps are loaded by main.mjs before this module's dependencies execute.
// Keep the legacy glob discovery until the explicit algorithm registry migration.
import.meta.glob(["./fn/fn.*.js", "./sort/sort.*.js", "./visualization/visualization.*.js"], {
  eager: true,
});
