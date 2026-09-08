import { describe, expect, test, vi } from "vitest";
import { readdirSync } from "node:fs";
import { generators } from "../src/generators/generator-registry.ts";
import { instruments } from "../src/midi/instruments.ts";

const names = ["sorted", "reverse", "randomUnique", "randomDupes", "almostSorted", "fewUnique"];

test("registry covers every generator without creating a global namespace", () => {
  const files = readdirSync(new URL("../src/generators/patterns/", import.meta.url))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => file.slice(0, -3).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()));
  expect(Object.keys(generators).sort()).toEqual([...names].sort());
  expect(files.sort()).toEqual([...names].sort());
  expect(Object.isFrozen(generators)).toBe(true);
  expect(Object.hasOwn(globalThis, "fn")).toBe(false);
});

test.each(names)("%s returns independent arrays", (name) => {
  const first = generators[name](5);
  const second = generators[name](5);
  expect(first).not.toBe(second);
  first.fill(-1);
  expect(second).not.toContain(-1);
});

test("random generators preserve their deterministic behavior", () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  expect(generators.randomUnique(5)).toEqual([1, 2, 3, 4, 0]);
  expect(generators.randomDupes(5)).toEqual([0, 0, 0, 0, 0]);
  expect(generators.almostSorted(5)).toEqual([0, 1, 2, 3, 4]);
  expect(generators.fewUnique(8)).toEqual([5, 3, 1, 7, 5, 3, 1, 7]);
});

describe.each(names)("%s generator", (name) => {
  test.each([0, 1, 5, 10, 48])("produces %i valid values", (size) => {
    const values = Array.from(generators[name](size));
    expect(values).toHaveLength(size);
    for (const value of values) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(size);
    }
  });
});

test.each([0, 1, 5, 10, 48])(
  "ordered generators produce the expected sequence at size %i",
  (size) => {
    const ordered = Array.from({ length: size }, (_, i) => i);
    expect(Array.from(generators.sorted(size))).toEqual(ordered);
    expect(Array.from(generators.reverse(size))).toEqual([...ordered].reverse());
  },
);

describe.each(["randomUnique", "almostSorted"])("%s permutation", (name) => {
  test.each([0, 1, 5, 10, 48])("preserves every value at size %i", (size) => {
    const values = Array.from(generators[name](size));
    expect(values.sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, i) => i));
  });
});

test.each([0, 1, 5, 10, 48])("fewUnique emits at most four distinct values at size %i", (size) => {
  expect(new Set(generators.fewUnique(size)).size).toBeLessThanOrEqual(4);
});

test("includes all 128 General MIDI instruments", () => {
  expect(instruments).toHaveLength(128);
});
