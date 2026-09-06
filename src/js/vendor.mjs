// Compatibility boundary: classic scripts in footer.html load before main.mjs.
// Keep plugin-bearing jQuery and the legacy audio/editor libraries unchanged.
export const { jQuery: $, sc, ace, d3, js_beautify, timbre, saveAs, Midi } = globalThis;
