import { defineConfig } from "cspell";

export default defineConfig({
  version: "0.2",
  language: "en-US",
  useGitignore: true,
  validateDirectives: true,
  files: ["**/*.{md,ts,tsx,mjs,js,css,html,json,yml,yaml}"],
  ignorePaths: [
    "pnpm-lock.yaml",
    "src/route-tree.gen.ts",
    "public/**",
    // Preserve the original scale catalogue without maintaining a dictionary of its names.
    "src/midi/scales.ts",
  ],
  dictionaryDefinitions: [
    { name: "project", path: ".cspell/project.txt", addWords: true },
    { name: "music", path: ".cspell/music.txt" },
  ],
  dictionaries: ["project", "music"],
  overrides: [
    {
      filename: ["README.md", "cspell.config.ts"],
      words: [
        "appspot",
        "bostock",
        "caseyrule",
        "corte",
        "elghamry",
        "escherba",
        "joshuakehn",
        "karim",
        "nzakas",
        "rosettacode",
        "sortdemo",
        "sortvis",
        "visu",
        "visualised",
        "visualsort",
        "webcloud",
        "wikibooks",
      ],
    },
    {
      filename: ["test/browser/**", "cspell.config.ts"],
      words: ["addthis", "googletagmanager", "networkidle", "valuetext"],
    },
  ],
});
