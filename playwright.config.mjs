import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/browser",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    browserName: "chromium",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  projects: [
    { name: "root", use: { baseURL: "http://127.0.0.1:4173/" } },
    { name: "pages", use: { baseURL: "http://127.0.0.1:4174/audio-sort/" } },
  ],
  webServer: [
    {
      command: "pnpm run preview --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173/",
    },
    {
      command: "pnpm exec sirv .test-pages --host 127.0.0.1 --port 4174",
      url: "http://127.0.0.1:4174/audio-sort/",
    },
  ],
});
