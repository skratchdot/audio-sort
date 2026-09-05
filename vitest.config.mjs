import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.mjs"],
    environment: "node",
    // VM-loaded files are outside Vite's import graph. Watch them explicitly
    // until the application is migrated to ES modules.
    forceRerunTriggers: [
      ...configDefaults.forceRerunTriggers,
      "**/js/{AS,_A,A.instruments}.js",
      "**/js/fn/*.js",
    ],
    clearMocks: true,
    restoreMocks: true,
  },
});
