import { describe, expect, test } from "vitest";
import { algorithmNames, loadAlgorithms, runAlgorithm, seededValues } from "./helpers/legacy.mjs";

const cases = [
  { name: "empty", values: [] },
  { name: "one item", values: [7] },
  { name: "sorted", values: [0, 1, 2, 3, 4] },
  { name: "reverse sorted", values: [4, 3, 2, 1, 0] },
  { name: "duplicates", values: [3, 1, 3, 2, 1, 0] },
  { name: "all equal", values: [2, 2, 2, 2] },
  { name: "negative and fractional", values: [-1, 0.5, -3, 0, -1] },
  ...Array.from({ length: 10 }, (_, seed) => ({
    name: `seed ${seed}`,
    values: seededValues(12 + seed, seed),
  })),
];

test("discovers the built-in algorithm registry", () => {
  expect(algorithmNames.length).toBeGreaterThan(0);
  expect(Object.keys(loadAlgorithms().sort).sort()).toEqual(algorithmNames);
});

describe.each(algorithmNames)("%s", (name) => {
  test.each(cases)("sorts $name and preserves every item in every frame", ({ values }) => {
    const input = values.map((value, index) => ({ id: `item-${index}`, value }));
    const original = structuredClone(input);
    const frames = runAlgorithm(name, input);
    const expectedIds = input.map((item) => item.id).sort();

    expect(input).toEqual(original);
    expect(frames.length).toBeGreaterThan(0);
    expect(Array.from(frames.at(-1).arr, (item) => item.value)).toEqual(
      [...values].sort((a, b) => a - b),
    );

    let comparisons = 0;
    let swaps = 0;
    for (const frame of frames) {
      expect(Array.from(frame.arr, (item) => item.id).sort()).toEqual(expectedIds);
      expect(Number.isInteger(frame.compareCount)).toBe(true);
      expect(Number.isInteger(frame.swapCount)).toBe(true);
      expect(frame.compareCount).toBeGreaterThanOrEqual(comparisons);
      expect(frame.swapCount).toBeGreaterThanOrEqual(swaps);
      comparisons = frame.compareCount;
      swaps = frame.swapCount;
    }
  });

  test("provides metadata used by the algorithm chooser", () => {
    const algorithm = loadAlgorithms().sort[name];
    for (const field of ["display", "best", "average", "worst", "memory", "method"]) {
      expect(typeof algorithm[field]).toBe("string");
      expect(algorithm[field].length).toBeGreaterThan(0);
    }
    expect(typeof algorithm.stable).toBe("boolean");
  });
});

describe("stable algorithms", () => {
  for (const name of algorithmNames) {
    if (!loadAlgorithms().sort[name].stable) continue;

    // Quick currently advertises stability but exchanges equal-valued items.
    // Keep this executable regression visible until its metadata is corrected.
    test(`${name} preserves equal-item order as advertised`, { fails: name === "quick" }, () => {
      const input = [2, 1, 2, 1, 2, 1].map((value, i) => ({ id: `item-${i}`, value }));
      const expected = [...input].sort((a, b) => a.value - b.value);
      const final = runAlgorithm(name, input).at(-1).arr;
      expect(Array.from(final, (item) => item.id)).toEqual(expected.map((item) => item.id));
    });
  }
});
