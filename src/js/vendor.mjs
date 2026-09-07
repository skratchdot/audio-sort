import timbre from "timbre/timbre.dev.js";

// Only plugin-bearing jQuery still comes from classic scripts in footer.html.
export const { jQuery: $ } = globalThis;
export { timbre };
