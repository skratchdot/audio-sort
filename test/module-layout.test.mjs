import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

test("application modules and directories use lowercase kebab-case names", () => {
  const entries = readdirSync(new URL("../src/", import.meta.url), {
    recursive: true,
    withFileTypes: true,
  }).filter(
    (entry) =>
      !entry.name.startsWith(".") &&
      !entry.parentPath.split(/[\\/]/).some((part) => part.startsWith(".")),
  );
  expect(existsSync(new URL("../src/js/", import.meta.url))).toBe(false);
  expect(entries.length).toBeGreaterThan(0);
  for (const entry of entries) {
    // TanStack's root route and generated route tree have framework-owned names.
    if (entry.name === "__root.tsx" || entry.name === "route-tree.gen.ts") continue;
    // TanStack uses [.] to escape the literal dot in the legacy /index.html route.
    if (
      entry.isFile() &&
      join(entry.parentPath, entry.name) ===
        fileURLToPath(new URL("../src/routes/index[.]html.tsx", import.meta.url))
    )
      continue;
    expect(entry.name).toMatch(
      entry.isDirectory()
        ? /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
        : /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.(?:mjs|(?:d\.)?tsx?|css)$/,
    );
  }
});
