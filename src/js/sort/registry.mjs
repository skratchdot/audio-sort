import bubble from "./sort.bubble.mjs";
import heap from "./sort.heap.mjs";
import insertion from "./sort.insertion.mjs";
import quick from "./sort.quick.mjs";
import selection from "./sort.selection.mjs";

// Stable IDs shared by the UI and worker. Custom edits live in a separate catalog.
export const algorithms = Object.freeze({ bubble, heap, insertion, quick, selection });
for (const algorithm of Object.values(algorithms)) Object.freeze(algorithm);
