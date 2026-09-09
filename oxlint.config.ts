import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "unicorn", "oxc", "vitest", "typescript", "jsx-a11y"],
  categories: { correctness: "error" },
  env: { node: true },
  ignorePatterns: [
    "_ignore/**",
    "dist/**",
    ".tanstack/**",
    ".test-pages/**",
    "playwright-report/**",
    "public/**",
    "src/route-tree.gen.ts",
    "src/.11ty-vite/**",
    "test-results/**",
  ],
  rules: {
    // SVG/canvas images and live status regions intentionally use ARIA roles.
    "jsx-a11y/prefer-tag-over-role": "off",
    "typescript/consistent-type-definitions": ["error", "type"],
    "no-undef": "error",
    "no-var": "error",
    "prefer-const": "error",
    "one-var": ["error", "never"],
  },
  overrides: [
    {
      files: ["src/components/docs-page.tsx"],
      // Keyboard users must be able to scroll wide documentation tables.
      rules: { "jsx-a11y/no-noninteractive-tabindex": "off" },
    },
    {
      files: ["src/**/*.js", "src/**/*.mjs", "src/**/*.ts", "src/**/*.tsx"],
      env: { node: false, browser: true },
    },
    {
      files: ["src/worker.mjs"],
      env: { browser: false, worker: true },
    },
  ],
});
