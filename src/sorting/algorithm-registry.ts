import bubble from "./algorithms/bubble.mjs";
import cocktailShaker from "./algorithms/cocktail-shaker.mjs";
import comb from "./algorithms/comb.mjs";
import gnome from "./algorithms/gnome.mjs";
import heap from "./algorithms/heap.mjs";
import insertion from "./algorithms/insertion.mjs";
import quick from "./algorithms/quick.mjs";
import selection from "./algorithms/selection.mjs";

// Stable IDs shared by the UI and worker. Custom edits live in a separate catalog.
export const algorithms = Object.freeze({
  bubble,
  "cocktail-shaker": cocktailShaker,
  comb,
  gnome,
  heap,
  insertion,
  quick,
  selection,
});
for (const algorithm of Object.values(algorithms)) Object.freeze(algorithm);
