"use strict";

module.exports = async function (eleventyConfig) {
  const { default: EleventyVitePlugin } = await import("@11ty/eleventy-plugin-vite");
  const { resolve } = require("node:path");

  // Vite copies these unchanged from its public directory into the final site.
  eleventyConfig.addPassthroughCopy({
    "src/js/lib": "public/js/lib",
    "src/img": "public/img",
    "src/.nojekyll": "public/.nojekyll",
  });
  eleventyConfig.setServerPassthroughCopyBehavior("copy");
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: "src/.11ty-vite",
    viteOptions: {
      // Relative generated URLs work at both / and the /audio-sort/ Pages path.
      base: "./",
      // Preserve Bootstrap 2's legacy CSS until the UI migration removes its IE hacks.
      build: { cssMinify: false },
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
      output: "_site",
    },
    htmlTemplateEngine: "liquid",
    templateFormats: ["html"],
  };
};
