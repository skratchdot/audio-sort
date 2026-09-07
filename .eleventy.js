"use strict";

module.exports = async function (eleventyConfig) {
  const { default: EleventyVitePlugin } = await import("@11ty/eleventy-plugin-vite");
  const { default: react } = await import("@vitejs/plugin-react");
  const { default: tailwindcss } = await import("@tailwindcss/vite");
  const { resolve } = require("node:path");

  // The plugin stages root-level public/ for Vite to copy unchanged to dist/.
  eleventyConfig.setServerPassthroughCopyBehavior("copy");
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: "src/.11ty-vite",
    viteOptions: {
      // Relative generated URLs work at both / and the /audio-sort/ Pages path.
      base: "./",
      plugins: [react(), tailwindcss()],
      // Timbre's browser CommonJS entry publishes through `global.timbre`.
      define: { global: "globalThis" },
      resolve: {
        alias: {
          "/js": resolve("src/js"),
          "/css": resolve("src/css"),
        },
      },
    },
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "dist",
    },
    htmlTemplateEngine: "liquid",
    templateFormats: ["html"],
  };
};
