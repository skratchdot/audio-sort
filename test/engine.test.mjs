import { expect, test } from "vitest";
import { createSortEngine } from "../src/js/sorting/create-sort-engine.ts";

test("preserves the final playback frame even when a nonempty sort does no work", () => {
  const engine = createSortEngine();
  engine.init([1], "sort");
  const frames = engine.end("sort");
  expect(frames).toHaveLength(2);
  expect(frames[0]).toEqual(frames[1]);
  expect(frames[0].arr[0]).not.toBe(frames[1].arr[0]);
  expect(engine.size).toBe(engine.length);
  expect(engine.end("sort")).toHaveLength(3);
  engine.init([], "empty");
  expect(engine.end("empty")).toHaveLength(1);
});

test("importing and creating engines does not install a global AS", () => {
  expect(Object.hasOwn(globalThis, "AS")).toBe(false);
  createSortEngine();
  expect(Object.hasOwn(globalThis, "AS")).toBe(false);
});

test("interleaved engines have independent arrays, frames, counters, and tokens", () => {
  const first = createSortEngine();
  const second = createSortEngine();
  first.init(
    [
      { id: "a", value: 2 },
      { id: "b", value: 1 },
    ],
    "first",
  );
  first.highlight(0);
  first.gt(0, 1);
  second.init(
    [
      { id: "a", value: 4 },
      { id: "b", value: 3 },
    ],
    "second",
  );
  second.play(0);
  first.swap(0, 1);
  const firstFrames = first.end("first");
  const secondFrames = second.end("second");
  expect(firstFrames.at(-1).arr.map((item) => item.value)).toEqual([1, 2]);
  expect(secondFrames.at(-1).arr.map((item) => item.value)).toEqual([4, 3]);
  expect(firstFrames.at(-1)).toMatchObject({ compareCount: 1, swapCount: 1 });
  expect(secondFrames.at(-1)).toMatchObject({ compareCount: 0, swapCount: 0 });
  expect(secondFrames.flatMap((frame) => frame.arr).some((item) => item.highlight)).toBe(false);
  second.init([], "next");
  expect(first.getFrames()).toBe(firstFrames);
  expect(first.length()).toBe(2);
  expect(second.getFrames()).not.toBe(secondFrames);
});

test("init clears all pending markers even when IDs are reused after an unfinished run", () => {
  const AS = createSortEngine();
  const input = [
    { id: "a", value: 2 },
    { id: "b", value: 1 },
  ];
  AS.init(input, "first");
  AS.highlight(0);
  AS.play(0);
  AS.mark(0);
  AS.gt(0, 1);
  AS.swap(0, 1);
  const oldFrames = structuredClone(AS.getFrames());
  const oldReference = AS.getFrames();
  AS.init(input, "second");
  const frames = AS.end("second");
  expect(oldReference).toEqual(oldFrames);
  for (const frame of frames) {
    expect(frame).toMatchObject({ compareCount: 0, swapCount: 0 });
    for (const item of frame.arr) {
      for (const marker of ["play", "mark", "swap", "justSwapped", "compare", "highlight"]) {
        expect(item[marker]).toBeFalsy();
      }
    }
  }
});

test("records comparisons and swaps while preserving earlier frames", () => {
  const AS = createSortEngine();
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
  const AS = createSortEngine();
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
  const AS = createSortEngine();
  AS.init([1], "current");
  expect(AS.end("old")).toHaveLength(0);
  expect(AS.end("current").at(-1).arr[0].value).toBe(1);
});

test("resets frames and counters when initialized for a new sort", () => {
  const AS = createSortEngine();
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
