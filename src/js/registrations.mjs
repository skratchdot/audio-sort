// Bootstraps are loaded by main.mjs before this module's dependencies execute.
// Only generators/utilities remain legacy; sorts and visualizations use modules.
import.meta.glob(["./fn/fn.*.js"], {
  eager: true,
});
