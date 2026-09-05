import { expect, test } from "@playwright/test";
import { algorithmNames } from "../helpers/legacy.mjs";

test.beforeEach(async ({ page, baseURL }) => {
  // Analytics, sharing widgets, and remote soundfonts are not build dependencies.
  await page.addInitScript(() => {
    globalThis.addthis = { init() {} };
  });
  await page.route("**/*", (route) => {
    if (route.request().url().startsWith(new URL(baseURL).origin)) return route.continue();
    return route.fulfill({ body: "", contentType: "application/javascript" });
  });
});

test("built UI loads and all serialized algorithms execute in the bundled worker", async ({
  page,
  baseURL,
}) => {
  const errors = [];
  const missing = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (new URL(response.url()).origin === new URL(baseURL).origin && response.status() >= 400)
      missing.push(response.url());
  });
  const workerReady = page.waitForEvent("worker", {
    predicate: (worker) => /\/assets\/worker-/.test(worker.url()),
  });
  await page.goto("index.html");
  const workerURL = (await workerReady).url();
  expect(workerURL.startsWith(baseURL)).toBe(true);
  await expect(page.locator("#sort-options [data-sort]")).toHaveCount(algorithmNames.length);
  await expect(page.locator("#base-chart svg rect").first()).toBeVisible();
  await expect
    .poll(async () => Number(await page.locator("#sort-player .position-max").textContent()))
    .toBeGreaterThan(0);

  const results = await page.evaluate(
    async ({ workerURL, names }) => {
      const worker = new globalThis.Worker(workerURL, { type: "module" });
      const results = [];
      try {
        for (const name of [...names, "custom"]) {
          const response = new Promise((resolve, reject) => {
            worker.onmessage = (event) => resolve(event.data);
            worker.onerror = (event) => reject(new Error(event.message));
          });
          worker.postMessage({
            key: name,
            fn:
              name === "custom"
                ? new Function("AS.swap(0, 1);").toString()
                : globalThis.sort[name].toString(),
            arr: (name === "custom" ? [2, 1] : [5, 1, 3, 1, 2]).map((value, id) => ({ value, id })),
          });
          const result = await response;
          results.push({
            key: result.key,
            values: result.frames.at(-1).arr.map((item) => item.value),
          });
        }
      } finally {
        worker.terminate();
      }
      return results;
    },
    { workerURL, names: algorithmNames },
  );
  expect(results).toEqual([
    ...algorithmNames.map((key) => ({ key, values: [1, 1, 2, 3, 5] })),
    { key: "custom", values: [1, 2] },
  ]);
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});

for (const filename of ["about.html", "api.html"]) {
  test(`${filename} and its local assets load`, async ({ page, baseURL }) => {
    const missing = [];
    page.on("response", (response) => {
      if (new URL(response.url()).origin === new URL(baseURL).origin && response.status() >= 400)
        missing.push(response.url());
    });
    expect((await page.goto(filename)).status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(await page.locator('link[rel="stylesheet"]').evaluate((link) => !!link.sheet)).toBe(
      true,
    );
    expect(missing).toEqual([]);
  });
}
