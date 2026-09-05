import { expect, test } from "@playwright/test";
import { algorithmNames } from "../helpers/legacy.mjs";

test.beforeEach(async ({ page, baseURL }) => {
  // Analytics, sharing widgets, and remote soundfonts are not build dependencies.
  await page.addInitScript(() => {
    globalThis.addthis = { init() {} };
    globalThis.sortRequests = [];
    globalThis.sortReplies = [];
    const OriginalWorker = globalThis.Worker;
    if (!OriginalWorker) return;
    globalThis.Worker = class extends OriginalWorker {
      constructor(...args) {
        super(...args);
        this.addEventListener("message", ({ data }) => globalThis.sortReplies.push(data));
      }
      postMessage(data) {
        globalThis.sortRequests.push(data);
        super.postMessage(data);
      }
    };
  });
  await page.route("**/*", (route) => {
    if (route.request().url().startsWith(new URL(baseURL).origin)) return route.continue();
    return route.fulfill({ body: "", contentType: "application/javascript" });
  });
});

test("built UI loads and algorithm IDs execute in the bundled worker", async ({
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
  const sortWorker = await workerReady;
  const workerURL = sortWorker.url();
  expect(await sortWorker.evaluate(() => Object.hasOwn(globalThis, "AS"))).toBe(false);
  expect(await page.evaluate(() => Object.hasOwn(globalThis, "AS"))).toBe(false);
  expect(
    await page.evaluate(() =>
      ["A", "visualization"].filter((name) => Object.hasOwn(globalThis, name)),
    ),
  ).toEqual([]);
  expect(workerURL.startsWith(baseURL)).toBe(true);
  await expect(page.locator("#sort-options [data-sort]")).toHaveCount(algorithmNames.length);
  await expect(page.locator("#base-chart svg rect").first()).toBeVisible();
  await expect
    .poll(async () => Number(await page.locator("#sort-player .position-max").textContent()))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => globalThis.sortRequests[0])).toMatchObject({
    type: "builtin",
    id: "bubble",
  });
  expect(await page.evaluate(() => Object.hasOwn(globalThis.sortRequests[0], "source"))).toBe(
    false,
  );

  const results = await page.evaluate(
    async ({ workerURL, names }) => {
      const worker = new globalThis.Worker(workerURL, { type: "module" });
      const results = [];
      try {
        for (const name of [...names, "invalid", "failure", "mutate", "custom"]) {
          const response = new Promise((resolve, reject) => {
            worker.onmessage = (event) => resolve(event.data);
            worker.onerror = (event) => reject(new Error(event.message));
          });
          worker.postMessage({
            key: name,
            ...(name === "custom" || name === "failure" || name === "mutate"
              ? {
                  type: "custom",
                  source:
                    name === "failure"
                      ? "throw null;"
                      : name === "mutate"
                        ? "AS.swap = () => { throw new Error('leaked API'); };"
                        : "AS.swap(0, 1);",
                }
              : { type: "builtin", id: name }),
            arr: (name === "custom" ? [2, 1] : [5, 1, 3, 1, 2]).map((value, id) => ({ value, id })),
          });
          const result = await response;
          if (result.error) {
            results.push({ key: result.key, error: result.error });
            continue;
          }
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
    { key: "invalid", error: "Unknown algorithm ID" },
    { key: "failure", error: "null" },
    { key: "mutate", values: [5, 1, 3, 1, 2] },
    { key: "custom", values: [1, 2] },
  ]);
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});

test("all built-ins can be edited and saved from readable production source", async ({ page }) => {
  test.setTimeout(15000 + algorithmNames.length * 5000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  for (const id of algorithmNames) {
    await page.locator(`#sort-options [data-sort="${id}"]`).click();
    await page.locator("#modal-sort-open").click();
    await expect(page.locator("#modal-sort")).toBeVisible();
    const display = await page.locator("#sort-info-display").textContent();
    const source = await page
      .locator("#sort-algorithm .js-editor")
      .evaluate((element) => globalThis.ace.edit(element).getValue());
    expect(source).toContain("AS.");
    await page.locator("#save-algorithm-edit").click();
    await expect(page.locator("#modal-sort")).toBeHidden();
    await page.locator(`#sort-options [data-sort="${id}"]`).click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const request = globalThis.sortRequests.at(-1);
          const reply = globalThis.sortReplies.find((result) => result.key === request.key);
          return request.type === "custom" && !!reply;
        }),
      )
      .toBe(true);
    const reply = await page.evaluate(() =>
      globalThis.sortReplies.find((result) => result.key === globalThis.sortRequests.at(-1).key),
    );
    expect(reply.error).toBeUndefined();
    const values = reply.frames.at(-1).arr.map((item) => item.value);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    await page.locator("#modal-sort-open").click();
    await expect(page.locator("#sort-info-display")).toHaveText(display);
    await page.locator('#modal-sort .modal-footer [data-dismiss="modal"]').click();
    await expect(page.locator("#modal-sort")).toBeHidden();
  }
  expect(errors).toEqual([]);
});

for (const fallback of [false, true]) {
  test(`custom editor and built-in fallback (Worker disabled: ${fallback})`, async ({ page }) => {
    if (fallback)
      await page.addInitScript(() => {
        globalThis.Worker = undefined;
      });
    await page.goto("index.html");
    expect(await page.evaluate(() => Object.hasOwn(globalThis, "AS"))).toBe(false);
    await expect
      .poll(async () => Number(await page.locator("#sort-player .position-max").textContent()))
      .toBeGreaterThan(0);
    await page.locator("#add-algorithm-btn").click();
    await page.locator("#new-sort-name").fill("Custom smoke");
    await page
      .locator("#new-sort-algorithm .js-editor")
      .evaluate((element) => globalThis.ace.edit(element).setValue("AS.play(0);"));
    await page.locator("#save-algorithm-new").click();
    await expect(page.locator("#modal-add-algorithm")).toBeHidden();
    await page.locator("#sort-options a").filter({ hasText: "Custom smoke" }).click();
    // The engine records a played frame and a final frame for this custom body.
    await expect(page.locator("#sort-player .position-max")).toHaveText("2");
    if (!fallback)
      expect(await page.evaluate(() => globalThis.sortRequests.at(-1))).toMatchObject({
        type: "custom",
        source: expect.stringContaining("AS.play(0)"),
      });
  });
}

test("module UI connects data, visualization, playback navigation, sliders, and MIDI export", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  await page.locator('#base-buttons [data-action="reverse"]').click();
  await expect
    .poll(async () => Number(await page.locator("#sort-player .position-max").textContent()))
    .toBeGreaterThan(0);
  await page.locator('[data-visualization="flat"]').click();
  await expect(page.locator("#sort-chart svg path.line").first()).toBeVisible();
  await page.locator('[data-visualization="bar"]').click();
  await expect(page.locator("#sort-chart svg rect").first()).toBeVisible();
  await page.locator('#sort-player [data-action="goToLast"]').click();
  await expect(page.locator("#sort-player .position-current")).toHaveText(
    await page.locator("#sort-player .position-max").textContent(),
  );
  await page.locator('#sort-player [data-action="goToFirst"]').click();
  await expect(page.locator("#sort-player .position-current")).toHaveText("1");
  await page.locator('#sort-player [data-action="play"]').click();
  await expect
    .poll(async () => Number(await page.locator("#sort-player .position-current").textContent()))
    .toBeGreaterThan(1);
  await page.locator('#sort-player [data-action="stop"]').click();
  const originalVolume = await page.locator("#volume-display").textContent();
  const slider = page.locator("#volume-container .slider");
  const bounds = await slider.boundingBox();
  await slider.click({ position: { x: bounds.width * 0.6, y: bounds.height / 2 } });
  await expect(page.locator("#volume-display")).not.toHaveText(originalVolume);
  await page.locator('[data-midi-export="sort"]').click();
  await expect(page.locator("#midi-export-channel option")).toHaveCount(16);
  await expect(page.locator("#midi-export-instrument option")).toHaveCount(128);
  await page.locator("#midi-export-name").fill("module-smoke");
  const downloadReady = page.waitForEvent("download");
  await page.locator("#midi-export-btn").click();
  const download = await downloadReady;
  expect(download.suggestedFilename()).toBe("module-smoke.mid");
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  const bytes = Buffer.concat(chunks);
  expect(bytes.subarray(0, 4).toString()).toBe("MThd");
  expect(bytes.includes(Buffer.from("MTrk"))).toBe(true);
  expect(errors).toEqual([]);
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
