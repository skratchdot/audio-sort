import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { algorithmNames } from "../helpers/algorithms.mjs";
import { generators } from "../../src/js/generators/generator-registry.ts";
import { scales } from "../../src/js/midi/scales.ts";

test("all local scales populate the menu without subcollider", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  await expect(page.locator("[data-scale]")).toHaveCount(108);
  const actual = await page
    .locator("[data-scale]")
    .evaluateAll((elements) =>
      elements.map((element) => [element.getAttribute("data-scale"), element.textContent.trim()]),
    );
  const expected = Object.entries(scales)
    .sort(
      ([, a], [, b]) =>
        a.pitchesPerOctave - b.pitchesPerOctave ||
        a.degrees.length - b.degrees.length ||
        a.name.localeCompare(b.name),
    )
    .map(([id, scale]) => [id, scale.name]);
  expect(actual).toEqual(expected);
  expect(await page.evaluate(() => typeof globalThis.sc)).toBe("undefined");
  expect(errors).toEqual([]);
});

test("public assets are copied unchanged and CSS images load under the site base", async ({
  page,
  request,
  baseURL,
}) => {
  const source = fileURLToPath(new URL("../../public/", import.meta.url));
  const output = fileURLToPath(new URL("../../dist/", import.meta.url));
  const files = readdirSync(source, { recursive: true, withFileTypes: true }).filter(
    (entry) => entry.isFile() && entry.name !== ".DS_Store",
  );
  for (const entry of files) {
    const sourceFile = join(entry.parentPath, entry.name);
    const assetPath = relative(source, sourceFile);
    expect(readFileSync(join(output, assetPath)).equals(readFileSync(sourceFile)), assetPath).toBe(
      true,
    );
  }
  await page.goto("index.html");
  for (const selector of ["#header", ".icon-repeat", ".icon-white"]) {
    const background = await page
      .locator(selector)
      .first()
      .evaluate((element) => globalThis.getComputedStyle(element).backgroundImage);
    const url = background.match(/url\(["']?(.*?)["']?\)/)?.[1];
    expect(url).toBeTruthy();
    expect(url.startsWith(`${baseURL}img/`)).toBe(true);
    expect((await request.get(url)).ok()).toBe(true);
  }
});

test("every data generator feeds valid input to the worker", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  await expect.poll(() => page.evaluate(() => globalThis.sortReplies.length)).toBeGreaterThan(0);
  for (const name of Object.keys(generators)) {
    const previousKey = await page.evaluate(() => globalThis.sortRequests.at(-1).key);
    await page.locator(`#base-buttons [data-action="${name}"]`).click();
    await expect
      .poll(() => page.evaluate(() => globalThis.sortRequests.at(-1).key))
      .not.toBe(previousKey);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const key = globalThis.sortRequests.at(-1).key;
          return globalThis.sortReplies.some((reply) => reply.key === key);
        }),
      )
      .toBe(true);
    const { request, reply } = await page.evaluate(() => {
      const request = globalThis.sortRequests.at(-1);
      return { request, reply: globalThis.sortReplies.find((item) => item.key === request.key) };
    });
    const values = request.arr;
    expect(values).toHaveLength(12);
    expect(values.every((value) => Number.isInteger(value) && value >= 0 && value < 12)).toBe(true);
    if (name === "sorted") expect(values).toEqual(Array.from({ length: 12 }, (_, i) => i));
    if (name === "reverse") expect(values).toEqual(Array.from({ length: 12 }, (_, i) => 11 - i));
    expect(reply.error).toBeUndefined();
    expect(reply.frames.at(-1).arr.map((item) => item.value)).toEqual(
      [...values].sort((a, b) => a - b),
    );
  }
  expect(await page.evaluate(() => Object.hasOwn(globalThis, "fn"))).toBe(false);
  expect(errors).toEqual([]);
});

test("production output contains only public pages and assets", () => {
  const output = new URL("../../dist/", import.meta.url);
  expect(readdirSync(output).sort()).toEqual([
    ".nojekyll",
    "about.html",
    "api.html",
    "assets",
    "img",
    "index.html",
    "js",
  ]);
  // Only public pages should be rendered, with no source-directory nesting.
  const pages = readdirSync(output, { recursive: true }).filter((file) => file.endsWith(".html"));
  expect(pages.sort()).toEqual(["about.html", "api.html", "index.html"]);
  for (const filename of pages) {
    const html = readFileSync(new URL(filename, output), "utf8");
    expect(html.match(/<!doctype html>/gi)).toHaveLength(1);
    expect(html.match(/<\/html>/gi)).toHaveLength(1);
    expect(html).not.toContain("{%");
    expect(html).not.toMatch(/addthis|google-analytics|googletagmanager|gtag\(|UA-10768188-1/i);
  }
});

test.beforeEach(async ({ page, baseURL }) => {
  // Remote soundfonts are not build dependencies.
  await page.addInitScript(() => {
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

test("header stays within the viewport without sharing widgets", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("about.html");
    const title = page.locator("#header-title");
    const navigation = page.locator("#header-nav");
    await expect(title).toBeVisible();
    await expect(navigation.locator("a")).toHaveText(["Home", "About", "API", "Source"]);
    const titleBox = await title.boundingBox();
    const navBox = await navigation.boundingBox();
    for (const box of [titleBox, navBox]) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(
      titleBox.x + titleBox.width <= navBox.x || titleBox.y + titleBox.height <= navBox.y,
    ).toBe(true);
    if (width >= 768) {
      expect(
        Math.abs(titleBox.y + titleBox.height / 2 - (navBox.y + navBox.height / 2)),
      ).toBeLessThanOrEqual(1);
    } else {
      expect(navBox.y).toBeGreaterThanOrEqual(titleBox.y + titleBox.height);
    }
  }
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
  await expect(page.locator("#wrapper > #header")).toHaveCount(1);
  await expect(page.locator("#wrapper > #base-section")).toHaveCount(1);
  await expect(page.locator("body > #footer")).toHaveCount(1);
  const workerURL = sortWorker.url();
  expect(await sortWorker.evaluate(() => Object.hasOwn(globalThis, "AS"))).toBe(false);
  expect(await page.evaluate(() => Object.hasOwn(globalThis, "AS"))).toBe(false);
  expect(
    await page.evaluate(() =>
      ["A", "visualization", "fn"].filter((name) => Object.hasOwn(globalThis, name)),
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

test("Ace loads on demand and a closed dialog cannot finish initializing", async ({ page }) => {
  const editorRequests = [];
  let releaseEditor;
  const editorGate = new Promise((resolve) => {
    releaseEditor = resolve;
  });
  await page.route("**/assets/create-code-editor-*.js", async (route) => {
    editorRequests.push(route.request().url());
    await editorGate;
    await route.continue();
  });
  await page.goto("index.html");
  expect(await page.evaluate(() => typeof globalThis.ace)).toBe("undefined");
  expect(editorRequests).toEqual([]);
  await page.locator("#modal-sort-open").click();
  await expect(page.locator("#modal-sort .editor-status")).toHaveText("Loading editor…");
  await expect(page.locator("#save-algorithm-edit")).toHaveAttribute("aria-disabled", "true");
  await page.locator("#save-algorithm-edit").dispatchEvent("click");
  await expect(page.locator("#modal-sort")).toBeVisible();
  await page.locator('#modal-sort .modal-footer [data-dismiss="modal"]').click();
  await expect(page.locator("#modal-sort")).toBeHidden();
  releaseEditor();
  await expect.poll(() => page.evaluate(() => typeof globalThis.ace)).toBe("object");
  await expect(page.locator("#sort-algorithm .js-editor")).toHaveCount(0);
  await page.locator("#add-algorithm-btn").click();
  await expect(page.locator("#save-algorithm-new")).toHaveAttribute("aria-disabled", "false");
  await expect(page.locator("#new-sort-algorithm .js-editor")).toHaveCount(1);
  expect(editorRequests).toHaveLength(1);
});

test("an editor download failure keeps Save disabled and offers recovery", async ({ page }) => {
  await page.route("**/assets/create-code-editor-*.js", (route) => route.abort());
  await page.goto("index.html");
  await page.locator("#add-algorithm-btn").click();
  await expect(page.locator("#modal-add-algorithm [role=alert]")).toContainText(
    "The editor could not load.",
  );
  await expect(page.locator("#save-algorithm-new")).toHaveAttribute("aria-disabled", "true");
  await page.locator("#new-sort-name").fill("Unavailable editor");
  await page.locator("#save-algorithm-new").dispatchEvent("click");
  await expect(page.locator("#modal-add-algorithm")).toBeVisible();
  await page.unroute("**/assets/create-code-editor-*.js");
  await page.getByRole("button", { name: "Reload page" }).click();
  await page.waitForLoadState("load");
  await page.locator("#add-algorithm-btn").click();
  await expect(page.locator("#save-algorithm-new")).toHaveAttribute("aria-disabled", "false");
});

test("editor supports modern JavaScript, syntax diagnostics, and two-space soft tabs", async ({
  page,
}) => {
  await page.goto("index.html");
  await page.locator("#modal-sort-open").click();
  await expect(page.locator("#modal-sort")).toBeVisible();
  const editor = page.locator("#sort-algorithm .js-editor");
  await page.locator('#modal-sort a[href="#sort-algorithm"]').click();
  await editor.evaluate((element) => {
    const editor = globalThis.ace.edit(element);
    editor.setValue("let = ;");
  });
  await expect
    .poll(() =>
      editor.evaluate((element) => globalThis.ace.edit(element).session.getAnnotations().length),
    )
    .toBeGreaterThan(0);
  await editor.evaluate((element) => {
    globalThis.ace
      .edit(element)
      .setValue("const values = [1, 2];\nlet index = values?.[0] ?? 0;\nAS.play(index);\nreturn;");
  });
  await expect
    .poll(() => editor.evaluate((element) => globalThis.ace.edit(element).session.getAnnotations()))
    .toEqual([]);
  expect(
    await editor.evaluate((element) => {
      const editor = globalThis.ace.edit(element);
      return { tabSize: editor.session.getTabSize(), softTabs: editor.session.getUseSoftTabs() };
    }),
  ).toEqual({ tabSize: 2, softTabs: true });
  await editor.evaluate((element) => {
    const editor = globalThis.ace.edit(element);
    editor.setValue("", -1);
    editor.focus();
  });
  await page.keyboard.press("Tab");
  expect(await editor.evaluate((element) => globalThis.ace.edit(element).getValue())).toBe("  ");
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

test("D3 joins resize bars, markers, and paths without stale elements", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  const slider = page.locator("#data-size-container .slider");
  const bounds = await slider.boundingBox();
  let previousSize = 12;
  for (const fraction of [0.7, 0.15]) {
    await slider.click({ position: { x: bounds.width * fraction, y: bounds.height / 2 } });
    const size = Number(await page.locator("#data-size-display").textContent());
    expect(size).not.toBe(previousSize);
    previousSize = size;
    await expect(page.locator("#base-chart svg rect")).toHaveCount(size);
    await expect(page.locator("#sort-chart svg rect")).toHaveCount(size);
    for (const marker of ["highlight", "justSwapped", "swap", "compare", "mark"]) {
      await expect(page.locator(`#sort-chart svg circle.${marker}`)).toHaveCount(size);
      await expect(page.locator(`#sort-chart svg circle.${marker}`).first()).toHaveAttribute(
        "cx",
        /%$/,
      );
    }
    await page.locator('[data-visualization="flat"]').click();
    await expect(page.locator("#sort-chart svg path.line")).toHaveCount(size);
    const paths = await page
      .locator("#sort-chart svg path.line")
      .evaluateAll((elements) => elements.map((element) => element.getAttribute("d")));
    expect(paths.every((path) => path?.startsWith("M") && !/NaN|Infinity/.test(path))).toBe(true);
    await page.locator('[data-visualization="bar"]').click();
    await expect(page.locator("#sort-chart svg path.line")).toHaveCount(0);
    await expect(page.locator("#sort-chart svg rect")).toHaveCount(size);
  }
  expect(errors).toEqual([]);
});

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
  await expect(page.locator("#sort-chart svg path.line").first()).toHaveAttribute("d", /^M/);
  expect(await page.evaluate(() => typeof globalThis.d3)).toBe("undefined");
  await expect(page.locator('script[src*="d3.v3"]')).toHaveCount(0);
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
  expect(bytes.readUInt32BE(18)).toBe(bytes.length - 22);
  expect(bytes.includes(Buffer.from("Audio Sort <skratchdot.com>"))).toBe(true);
  expect(bytes.subarray(-4)).toEqual(Buffer.from([0, 0xff, 0x2f, 0]));
  await expect(page.locator('script[src*="jsmidgen"], script[src*="FileSaver"]')).toHaveCount(0);
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
