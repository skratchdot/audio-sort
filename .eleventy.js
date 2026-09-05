"use strict";

module.exports = async function (eleventyConfig) {
  const { default: EleventyVitePlugin } = await import("@11ty/eleventy-plugin-vite");
  const { resolve } = require("node:path");

  // Vite copies these unchanged from its public directory into the final site.
  eleventyConfig.addPassthroughCopy({
    "js/lib": "public/js/lib",
    img: "public/img",
    ".nojekyll": "public/.nojekyll",
  });
  eleventyConfig.setServerPassthroughCopyBehavior("copy");
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    viteOptions: {
      // Relative generated URLs work at both / and the /audio-sort/ Pages path.
      base: "./",
      // Preserve Bootstrap 2's legacy CSS until the UI migration removes its IE hacks.
      build: { cssMinify: false },
      resolve: {
        alias: {
          "/js": resolve("js"),
          "/css": resolve("css"),
        },
      },
    },
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
    htmlTemplateEngine: "liquid",
    templateFormats: ["html"],
  };
};
