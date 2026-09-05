// Original source is for the editor only, never for executing built-in sorts.
// Keep this separate so the worker does not bundle readable source strings.
import bubble from "./sort.bubble.mjs?raw";
import heap from "./sort.heap.mjs?raw";
import insertion from "./sort.insertion.mjs?raw";
import quick from "./sort.quick.mjs?raw";
import selection from "./sort.selection.mjs?raw";

export const sources = Object.freeze({ bubble, heap, insertion, quick, selection });
