// Compatibility boundary: classic scripts in footer.html load before main.mjs.
// Keep plugin-bearing jQuery and the legacy audio libraries unchanged.
export const { jQuery: $, sc, d3, timbre } = globalThis;
