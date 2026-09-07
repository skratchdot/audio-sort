import { expect, test, vi } from "vitest";
import random from "../src/js/utilities/random.ts";
import shuffle from "../src/js/utilities/shuffle.ts";
import swap from "../src/js/utilities/swap.ts";

test("random includes both integer endpoints", () => {
  const rng = vi.spyOn(Math, "random").mockReturnValue(0);
  expect(random(-2, 3)).toBe(-2);
  rng.mockReturnValue(0.999999);
  expect(random(-2, 3)).toBe(3);
  expect(random(4, 4)).toBe(4);
});

test("swap mutates and returns the same array, preserving index coercion", () => {
  const arr = [10, 20, 30];
  expect(swap(arr, "0", "2")).toBe(arr);
  expect(arr).toEqual([30, 20, 10]);
  swap(arr, undefined, "1");
  expect(arr).toEqual([20, 30, 10]);
});

test.each([
  [0, 0],
  [-1, 1],
  [0, 3],
])("swap ignores indices %i and %i", (one, two) => {
  const arr = [10, 20, 30];
  expect(swap(arr, one, two)).toBe(arr);
  expect(arr).toEqual([10, 20, 30]);
});

test.each([{ values: [] }, { values: [1] }])(
  "shuffle leaves trivial arrays unchanged: $values",
  ({ values }) => {
    const rng = vi.spyOn(Math, "random");
    const arr = [...values];
    expect(shuffle(arr)).toBe(arr);
    expect(arr).toEqual(values);
    expect(rng).not.toHaveBeenCalled();
  },
);

test("shuffle uses Fisher-Yates in place", () => {
  const rng = vi.spyOn(Math, "random").mockReturnValue(0);
  const arr = [0, 1, 2, 3];
  expect(shuffle(arr)).toBe(arr);
  expect(arr).toEqual([1, 2, 3, 0]);
  expect(rng).toHaveBeenCalledTimes(3);
});

test("generic array utilities preserve object identity", () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  const first = { value: 1 };
  const second = { value: 2 };
  const arr = [first, second];
  expect(swap(arr, 0, 1)).toBe(arr);
  expect(arr[0]).toBe(second);
  expect(shuffle(arr)).toBe(arr);
  expect(arr[0]).toBe(first);
  expect(arr[1]).toBe(second);
});

test("swap retains partial-string, fractional, and null index coercion", () => {
  const arr = [10, 20, 30];
  swap(arr, "1tail", 2.9);
  expect(arr).toEqual([10, 30, 20]);
  swap(arr, null, "invalid");
  expect(arr).toEqual([10, 30, 20]);
});
