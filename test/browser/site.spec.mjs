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
    globalThis.sortWorkers = [];
    const OriginalWorker = globalThis.Worker;
    if (!OriginalWorker) return;
    globalThis.Worker = class extends OriginalWorker {
      constructor(...args) {
        super(...args);
        if (
          String(args[0]).includes("/assets/worker-") &&
          !String(args[0]).includes("worker-javascript")
        ) {
          globalThis.sortWorkers.push(this);
        }
        this.addEventListener("message", ({ data }) => globalThis.sortReplies.push(data));
      }
      postMessage(data) {
        globalThis.sortRequests.push(data);
        super.postMessage(data);
      }
      terminate() {
        this.wasTerminated = true;
        super.terminate();
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

test("playback preferences toggle independently and autoplay starts a selected sort", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  const baseLoop = page.locator('#base-section [data-action="loop"]');
  const sortLoop = page.locator('#sort-section [data-action="loop"]');
  const autoPlay = page.locator("#sort-autoplay");
  await expect(baseLoop).toHaveAttribute("aria-pressed", "true");
  await expect(sortLoop).toHaveAttribute("aria-pressed", "true");
  await baseLoop.click();
  await expect(baseLoop).toHaveAttribute("aria-pressed", "false");
  await expect(sortLoop).toHaveAttribute("aria-pressed", "true");
  await sortLoop.click();
  await expect(sortLoop).toHaveAttribute("aria-pressed", "false");
  await sortLoop.click();
  await expect(sortLoop).toHaveAttribute("aria-pressed", "true");
  await expect(autoPlay).toHaveAttribute("aria-pressed", "false");
  await autoPlay.click();
  await expect(autoPlay).toHaveAttribute("aria-pressed", "true");
  await expect(autoPlay).toHaveClass(/active/);
  await page.locator('#sort-options [data-sort="insertion"]').click();
  await expect
    .poll(async () => Number(await page.locator("#sort-player .position-current").textContent()))
    .toBeGreaterThan(1);
  await page.locator('#sort-player [data-action="stop"]').click();
  await autoPlay.click();
  await expect(autoPlay).toHaveAttribute("aria-pressed", "false");
  await expect(autoPlay).not.toHaveClass(/active/);
  expect(errors).toEqual([]);
});

test("settings subscriptions reconnect after a cached-page lifecycle", async ({ page }) => {
  await page.goto("index.html");
  const autoPlay = page.locator("#sort-autoplay");
  await expect(autoPlay).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() =>
    globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pagehide", { persisted: true })),
  );
  await autoPlay.click(); // Handler changes the store while rendering is disconnected.
  await expect(autoPlay).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() =>
    globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pageshow", { persisted: true })),
  );
  await expect(autoPlay).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() =>
    globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pageshow", { persisted: true })),
  );
  await autoPlay.click();
  await expect(autoPlay).toHaveAttribute("aria-pressed", "false");
});

test("teardown clears owned resources and repeated remounts do not duplicate UI or handlers", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  await page.locator('#sort-options [data-sort="insertion"]').click();
  const initialScaleCount = await page.locator("#scale-options li").count();
  const initialSliderCount = await page.locator(".audio-sort-slider").count();
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.locator("#add-algorithm-btn").click();
    await expect(page.locator("#new-sort-algorithm .js-editor")).toHaveCount(1);
    await page.evaluate(() => {
      globalThis.dispatchEvent(
        new globalThis.PageTransitionEvent("pagehide", { persisted: false }),
      );
      globalThis.dispatchEvent(
        new globalThis.PageTransitionEvent("pagehide", { persisted: false }),
      );
    });
    await expect(
      page.locator(".js-editor, .editor-status, .modal-backdrop, .audio-sort-slider"),
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => globalThis.sortWorkers.every((worker) => worker.wasTerminated)),
    ).toBe(true);
    expect(
      await page.evaluate(() => {
        const $ = globalThis.jQuery;
        return $("body")
          .find("*")
          .addBack()
          .get()
          .some((element) =>
            Object.values($._data(element, "events") || {})
              .flat()
              .some((handler) => /audioSort/.test(handler.namespace)),
          );
      }),
    ).toBe(false);
    await page.evaluate(() =>
      globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pageshow", { persisted: true })),
    );
    await expect(page.locator("#scale-options li")).toHaveCount(initialScaleCount);
    await expect(page.locator(".audio-sort-slider")).toHaveCount(initialSliderCount);
    await expect(page.locator("#sort-options li.active a")).toHaveAttribute(
      "data-sort",
      "insertion",
    );
    const before = await page.evaluate(() => globalThis.sortRequests.length);
    await page.locator('#sort-options [data-sort="bubble"]').click();
    await expect.poll(() => page.evaluate(() => globalThis.sortRequests.length)).toBe(before + 1);
    await page.locator('#sort-options [data-sort="insertion"]').click();
  }
  expect(errors).toEqual([]);
});

test("destroy during an editor download cannot initialize a stale editor", async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  let requested;
  const requestStarted = new Promise((resolve) => {
    requested = resolve;
  });
  await page.route("**/assets/create-code-editor-*.js", async (route) => {
    requested();
    await pending;
    await route.continue();
  });
  await page.goto("index.html");
  await page.locator("#add-algorithm-btn").click();
  await requestStarted;
  await page.evaluate(() =>
    globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pagehide", { persisted: false })),
  );
  const loaded = page.waitForResponse(/create-code-editor-.*\.js/);
  release();
  await loaded;
  await expect(page.locator(".js-editor, .editor-status")).toHaveCount(0);
  await page.evaluate(() =>
    globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pageshow", { persisted: true })),
  );
  await page.locator("#add-algorithm-btn").click();
  await expect(page.locator("#new-sort-algorithm .js-editor")).toHaveCount(1);
});

test("teardown cancels pending audio resume and removes only owned slider drag handlers", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  await page.evaluate(() => {
    globalThis.pendingResume = new Promise((resolve) => {
      globalThis.finishResume = resolve;
    });
    globalThis.timbre.fn._audioContext.resume = () => globalThis.pendingResume;
    globalThis.jQuery(globalThis.document).on("mousemove.lifecycleWitness", () => {});
  });
  await page.locator('#sort-player [data-action="play"]').click();
  const slider = page.locator("#volume-container .slider");
  const box = await slider.boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
  await page.mouse.down();
  await page.evaluate(() => {
    globalThis.oldDrag = globalThis
      .jQuery("#volume-container .audio-sort-slider")
      .data("slider").mousemove;
    globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pagehide", { persisted: false }));
    globalThis.finishResume();
  });
  await page.mouse.up();
  const handlers = await page.evaluate(() => {
    const events = globalThis.jQuery._data(globalThis.document, "events") || {};
    return {
      ownsDrag: Object.values(events)
        .flat()
        .some((handler) => handler.guid === globalThis.oldDrag.guid),
      keepsOther: (events.mousemove || []).some(
        (handler) => handler.namespace === "lifecycleWitness",
      ),
    };
  });
  expect(handlers).toEqual({ ownsDrag: false, keepsOther: true });
  await expect(page.locator(".audio-sort-slider")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("base data remains draggable across renderer data updates", async ({ page }) => {
  await page.goto("index.html");
  const svg = page.locator("#base-svg");
  const box = await svg.boundingBox();
  await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.8);
  const before = await page.evaluate(() => globalThis.sortRequests.length);
  await page.mouse.down();
  await expect
    .poll(() => page.evaluate(() => globalThis.sortRequests.length))
    .toBeGreaterThan(before);
  const afterFirst = await page.evaluate(() => globalThis.sortRequests.length);
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);
  await expect
    .poll(() => page.evaluate(() => globalThis.sortRequests.length))
    .toBeGreaterThan(afterFirst);
  await page.mouse.up();
});

test("resizing and saving a selected algorithm update sorting without reselecting", async ({
  page,
}) => {
  await page.goto("index.html");
  const sizeSlider = page.locator("#data-size-container .slider");
  const bounds = await sizeSlider.boundingBox();
  await sizeSlider.click({ position: { x: bounds.width * 0.4, y: bounds.height / 2 } });
  const size = Number(await page.locator("#data-size-display").textContent());
  await expect
    .poll(() => page.evaluate(() => globalThis.sortRequests.at(-1)?.arr.length))
    .toBe(size);
  await page.locator("#modal-sort-open").click();
  await page.locator('#modal-sort a[href="#sort-algorithm"]').click();
  await page
    .locator("#sort-algorithm .js-editor")
    .evaluate((element) => globalThis.ace.edit(element).setValue("AS.play(0);"));
  await page.locator("#save-algorithm-edit").click();
  await expect.poll(() => page.evaluate(() => globalThis.sortRequests.at(-1)?.type)).toBe("custom");
  await expect(page.locator("#sort-player .position-max")).toHaveText("2");
});

test("soundfonts decode native audio and play buffered notes without JSONP", async ({ page }) => {
  // A tiny stereo WAV fixture served at the MP3 URL exercises native content
  // decoding without depending on the external sample host during CI.
  const frames = 800;
  const wav = Buffer.alloc(44 + frames * 4);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(32000, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(frames * 4, 40);
  for (let i = 0; i < frames; i++) {
    wav.writeInt16LE(Math.round(Math.sin(i * 0.2) * 10000), 44 + i * 4);
    wav.writeInt16LE(Math.round(Math.cos(i * 0.2) * 5000), 46 + i * 4);
  }
  const requests = [];
  await page.route("**/free-midi/**/*.mp3", (route) => {
    requests.push(route.request().url());
    return route.fulfill({
      body: wav,
      contentType: "audio/wav",
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await page.goto("index.html");
  await page.evaluate(() => {
    const T = globalThis.timbre;
    globalThis.samplePlays = [];
    const prototype = T.fn.getClass("buffer").prototype;
    const bang = prototype.bang;
    prototype.bang = function (...args) {
      globalThis.samplePlays.push({
        channels: this._.channels,
        length: this.buffer.buffer[0].length,
        peak: Math.max(...this.buffer.buffer[0]),
      });
      return bang.apply(this, args);
    };
  });
  await page.locator('[data-audio-type="soundfont"].btn').click();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  // Replaying retries missed first-pass notes, matching preload-only cache misses.
  await expect(async () => {
    await page.locator('#base-section [data-action="play"]').click();
    await expect
      .poll(() => page.evaluate(() => globalThis.samplePlays.length), { timeout: 2000 })
      .toBeGreaterThan(0);
  }).toPass();
  const played = await page.evaluate(() => globalThis.samplePlays[0]);
  expect(played.channels).toBe(2);
  expect(played.length).toBeGreaterThan(0);
  expect(played.peak).toBeGreaterThan(0);
  expect(
    await page
      .locator('script[src*="free-midi"], script[src*="mp3_decode"], script[src*="audio-jsonp"]')
      .count(),
  ).toBe(0);
  expect(await page.evaluate(() => globalThis.timbre.soundfont)).toBeUndefined();
});

test("audio settings render selections and survive subscription reconnection", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  await page.locator('#settings a[href="#waveform"]').click();
  await expect(page.locator("#waveform-adshr-attack-display")).toHaveText("50 ms");
  await page.locator('#waveform button[data-waveform="sin"]').click();
  await expect(page.locator('#waveform button[data-waveform="sin"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator('#settings a[href="#audio"]').click();
  await expect(page.locator("#audio-type-display")).toHaveText("waveform: sin");
  await page.locator('[data-audio-type="soundfont"].btn').click();
  await expect(page.locator('#settings a[href="#soundfont"]')).toBeVisible();
  await expect(page.locator('#settings a[href="#waveform"]')).toBeHidden();
  await page.locator('#settings a[href="#soundfont"]').click();
  const instrument = page.locator('#soundfont-options li[data-soundfont="42"]');
  await instrument.click();
  await expect(page.locator("#soundfont-display")).toHaveText(await instrument.textContent());
  await page.locator('#settings a[href="#scale"]').click();
  const scale = page.locator('#scale-options li[data-scale="major"]');
  await scale.click();
  await expect(page.locator("#scale-display")).toHaveText(await scale.textContent());
  await page.evaluate(() => {
    globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pagehide", { persisted: true }));
    globalThis.dispatchEvent(new globalThis.PageTransitionEvent("pageshow", { persisted: true }));
  });
  await expect(scale).toHaveClass(/active/);
  await expect(instrument).toHaveClass(/active/);
  await page.locator('#settings a[href="#audio"]').click();
  await page.locator('[data-audio-type="waveform"].btn').click();
  await expect(page.locator("#audio-type-display")).toHaveText("waveform: sin");
  await expect(page.locator('#settings a[href="#waveform"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("envelope controls preserve the compact settings panel", async ({ page }) => {
  await page.goto("index.html");
  for (const width of [1280, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('#settings a[href="#audio"]').click();
    const before = await page.locator("#sort-section").boundingBox();
    await page.locator('#settings a[href="#waveform"]').click();
    const after = await page.locator("#sort-section").boundingBox();
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(2);
    const panel = await page.locator("#settings-content").boundingBox();
    for (const selector of ["#envelope-controls", ".waveform-section"]) {
      const controls = await page.locator(selector).boundingBox();
      expect(controls.y + controls.height).toBeLessThanOrEqual(panel.y + panel.height);
    }
  }
});

test("waveform envelope edits survive switching presets", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("index.html");
  await page.locator('#settings a[href="#waveform"]').click();
  await page.locator('#waveform button[data-waveform="string"]').click();
  const display = page.locator("#waveform-adshr-attack-display");
  const preview = page.locator("#waveform-canvas");
  await expect(preview).toHaveAttribute("aria-label", /String: illustrative/);
  const stringPreview = await preview.evaluate((canvas) => canvas.toDataURL());
  expect(
    await preview.evaluate((canvas) => {
      const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
      return pixels.some((value, index) => index % 4 === 3 && value > 0);
    }),
  ).toBe(true);
  await expect(page.locator("#waveform-adshr-hold-display")).toHaveText("200 ms");
  await expect(page.locator("#waveform-adshr-release-display")).toHaveText("300 ms");
  await expect(page.locator("#envelope-diagram")).toHaveAttribute(
    "aria-label",
    /sustain 50% for 200 ms/,
  );
  await expect(page.locator("#envelope-diagram")).toHaveAttribute("viewBox", "35 25 350 135");
  await expect(page.locator("#base-chart svg rect").first()).toBeVisible();
  await expect(display).toHaveText("50 ms");
  const slider = page.getByRole("slider", { name: "Attack", exact: true });
  await slider.focus();
  await slider.press("ArrowRight");
  await expect(display).not.toHaveText("50 ms");
  const attack = await display.textContent();
  await page.locator('#waveform button[data-waveform="sin"]').click();
  await expect(display).toHaveText(attack);
  await expect(preview).toHaveAttribute("aria-label", "sin oscillator waveform");
  expect(await preview.evaluate((canvas) => canvas.toDataURL())).not.toBe(stringPreview);
  const sustain = page.getByRole("slider", { name: "Sustain level", exact: true });
  await sustain.focus();
  await sustain.press("ArrowRight");
  await expect(page.locator("#waveform-adshr-sustain-display")).toHaveText("51%");
  await expect(sustain).toHaveAttribute("aria-valuetext", "51%");
  await expect(page.locator("#envelope-diagram")).toHaveAttribute(
    "aria-label",
    /sustain 51% for 200 ms/,
  );
  await page.locator('#waveform button[data-waveform="string"]').click();
  await expect(display).toHaveText(attack);
  expect(await preview.evaluate((canvas) => canvas.toDataURL())).toBe(stringPreview);
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
