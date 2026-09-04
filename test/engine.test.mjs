import { expect, test } from "vitest";
import { loadLegacy } from "./helpers/legacy.mjs";

test("records comparisons and swaps while preserving earlier frames", () => {
  const { AS } = loadLegacy(["js/AS.js"]);
  AS.init([2, 1], "sort");
  expect(AS.gt(0, 1)).toBe(true);
  AS.swap(0, 1);
  const frames = AS.end("sort");
  expect(Array.from(frames[0].arr, (item) => item.value)).toEqual([2, 1]);
  expect(frames[0].arr.every((item) => item.compare && item.swap)).toBe(true);
  expect(Array.from(frames.at(-1).arr, (item) => item.value)).toEqual([1, 2]);
  expect(frames.at(-1).compareCount).toBe(1);
  expect(frames.at(-1).swapCount).toBe(1);
});

test("tracks an item by identity after its index changes", () => {
  const { AS } = loadLegacy(["js/AS.js"]);
  AS.init(
    [
      { id: "first", value: 2 },
      { id: "second", value: 1 },
    ],
    "sort",
  );
  const first = AS.get(0);
  AS.swap(0, 1);
  AS.swap(first, 0);
  const frame = AS.end("sort").at(-1);
  expect(Array.from(frame.arr, (item) => item.id)).toEqual(["first", "second"]);
  expect(frame.swapCount).toBe(2);
});

test("requires the matching token to finish a sort", () => {
  const { AS } = loadLegacy(["js/AS.js"]);
  AS.init([1], "current");
  expect(AS.end("old")).toHaveLength(0);
  expect(AS.end("current").at(-1).arr[0].value).toBe(1);
});

test("resets frames and counters when initialized for a new sort", () => {
  const { AS } = loadLegacy(["js/AS.js"]);
  AS.init([2, 1], "first");
  AS.gt(0, 1);
  AS.swap(0, 1);
  AS.end("first");
  AS.init([], "second");
  expect(AS.length()).toBe(0);
  expect(AS.getFrames()).toHaveLength(0);
  const frame = AS.end("second")[0];
  expect(frame.arr).toHaveLength(0);
  expect(frame.compareCount).toBe(0);
  expect(frame.swapCount).toBe(0);
});
