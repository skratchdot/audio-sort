import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "unicorn", "oxc", "vitest", "typescript", "jsx-a11y", "react"],
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
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "error",
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
      // These effects initialize browser-only resources or read the client clock
      // after hydration; neither operation can run during prerendering.
      files: ["src/hooks/use-players.ts", "src/components/layout/footer.tsx"],
      rules: { "react/set-state-in-effect": "off" },
    },
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
      files: ["src/sorting/worker.ts"],
      env: { browser: false, worker: true },
    },
  ],
});
