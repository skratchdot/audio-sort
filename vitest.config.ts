import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          include: ["test/**/*.test.mjs"],
          exclude: ["test/**/*.browser.test.mjs"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "react",
          include: ["test/**/*.browser.test.mjs"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              launchOptions: {
                executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
              },
            }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
