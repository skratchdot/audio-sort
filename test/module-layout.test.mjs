import { readdirSync } from "node:fs";
import { expect, test } from "vitest";

test("application modules and directories use lowercase kebab-case names", () => {
  const entries = readdirSync(new URL("../src/js/", import.meta.url), {
    recursive: true,
    withFileTypes: true,
  }).filter((entry) => !entry.name.startsWith("."));
  expect(entries.length).toBeGreaterThan(0);
  for (const entry of entries) {
    expect(entry.name).toMatch(
      entry.isDirectory()
        ? /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
        : /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.(?:mjs|tsx?)$/,
    );
  }
});
