import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: [
    "_ignore/**",
    "dist/**",
    ".tanstack/**",
    ".test-pages/**",
    "playwright-report/**",
    "pnpm-lock.yaml",
    "public/**",
    "src/route-tree.gen.ts",
    "src/.11ty-vite/**",
    "test-results/**",
  ],
});
