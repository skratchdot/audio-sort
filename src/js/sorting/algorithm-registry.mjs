import bubble from "./algorithms/bubble.mjs";
import heap from "./algorithms/heap.mjs";
import insertion from "./algorithms/insertion.mjs";
import quick from "./algorithms/quick.mjs";
import selection from "./algorithms/selection.mjs";

// Stable IDs shared by the UI and worker. Custom edits live in a separate catalog.
export const algorithms = Object.freeze({ bubble, heap, insertion, quick, selection });
for (const algorithm of Object.values(algorithms)) Object.freeze(algorithm);
