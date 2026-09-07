import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/audio-sort/",
  plugins: [
    tanstackStart({
      router: { generatedRouteTree: "route-tree.gen.ts" },
      // Discover static routes automatically. Link crawling duplicates base-prefixed
      // URLs in the Pages build; these routes need no additional crawling.
      prerender: { enabled: true, crawlLinks: false },
    }),
    react(),
    tailwindcss(),
  ],
  // Timbre's browser CommonJS entry publishes through `global.timbre`.
  define: { global: "globalThis" },
  environments: {
    client: { build: { outDir: "dist/audio-sort" } },
    ssr: { build: { outDir: ".tanstack/server" } },
  },
});
