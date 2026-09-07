// Original source is for the editor only, never for executing built-in sorts.
// Keep this separate so the worker does not bundle readable source strings.
import bubble from "./algorithms/bubble.mjs?raw";
import heap from "./algorithms/heap.mjs?raw";
import insertion from "./algorithms/insertion.mjs?raw";
import quick from "./algorithms/quick.mjs?raw";
import selection from "./algorithms/selection.mjs?raw";

export const sources = Object.freeze({ bubble, heap, insertion, quick, selection });
