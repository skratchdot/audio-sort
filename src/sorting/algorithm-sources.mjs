// Original source is for the editor only, never for executing built-in sorts.
// Keep this separate so the worker does not bundle readable source strings.
import bubble from "./algorithms/bubble.mjs?raw";
import cocktailShaker from "./algorithms/cocktail-shaker.mjs?raw";
import comb from "./algorithms/comb.mjs?raw";
import gnome from "./algorithms/gnome.mjs?raw";
import heap from "./algorithms/heap.mjs?raw";
import insertion from "./algorithms/insertion.mjs?raw";
import quick from "./algorithms/quick.mjs?raw";
import selection from "./algorithms/selection.mjs?raw";

export const sources = Object.freeze({
  bubble,
  "cocktail-shaker": cocktailShaker,
  comb,
  gnome,
  heap,
  insertion,
  quick,
  selection,
});
