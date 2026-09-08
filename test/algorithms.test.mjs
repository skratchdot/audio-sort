import { algorithms } from "../src/sorting/algorithm-registry.mjs";
import { describe, expect, test } from "vitest";
import { algorithmNames, runAlgorithm, seededValues } from "./helpers/algorithms.mjs";

const cases = [
  { name: "empty", values: [] },
  { name: "one item", values: [7] },
  { name: "two reversed items", values: [2, 1] },
  { name: "two equal items", values: [1, 1] },
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
  expect(Object.keys(algorithms).sort()).toEqual(algorithmNames);
});

test("metadata describes the current recursive and full-prefix implementations", () => {
  expect({ ...algorithms.quick }).toMatchObject({
    stable: false,
    best: "nlogn",
    average: "nlogn",
    worst: "n^2",
    memory: "n",
  });
  expect(algorithms.heap.memory).toBe("logn");
  expect(algorithms.insertion.best).toBe("n^2");
});

test("Quick's equal-key swaps demonstrate why it is not stable", () => {
  const input = ["a", "b", "c"].map((id) => ({ id, value: 1 }));
  const output = runAlgorithm("quick", input).at(-1).arr;
  expect(output.map((item) => item.id)).not.toEqual(input.map((item) => item.id));
});

describe.each(["cocktail-shaker", "gnome", "comb"])("%s small-input coverage", (name) => {
  test("sorts every five-item array over three keys, preserving identities", () => {
    for (let code = 0; code < 3 ** 5; code++) {
      const input = Array.from({ length: 5 }, (_, i) => ({
        id: `item-${i}`,
        value: Math.floor(code / 3 ** i) % 3,
      }));
      const output = runAlgorithm(name, input).at(-1).arr;
      const expected = [...input].sort((a, b) => a.value - b.value);
      expect(output.map((item) => item.value)).toEqual(expected.map((item) => item.value));
      expect(output.map((item) => item.id).sort()).toEqual(input.map((item) => item.id).sort());
      const ids = output.map((item) => item.id);
      const expectedOrder = expected.map((item) => item.id);
      expect(algorithms[name].stable ? ids : ids.sort()).toEqual(
        algorithms[name].stable ? expectedOrder : expectedOrder.sort(),
      );
    }
  });
});

describe.each(["cocktail-shaker", "gnome"])("%s early exit", (name) => {
  test.each([
    [0, 1, 2, 3, 4],
    [1, 1, 1, 1, 1],
  ])("uses a single scan on ordered input %j", (...values) => {
    const final = runAlgorithm(name, values).at(-1);
    expect(final.compareCount).toBe(values.length - 1);
    expect(final.swapCount).toBe(0);
  });
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
    const algorithm = algorithms[name];
    for (const field of ["display", "best", "average", "worst", "memory", "method"]) {
      expect(typeof algorithm[field]).toBe("string");
      expect(algorithm[field].length).toBeGreaterThan(0);
    }
    expect(typeof algorithm.stable).toBe("boolean");
  });
});

describe("stable algorithms", () => {
  for (const name of algorithmNames) {
    if (!algorithms[name].stable) continue;

    test(`${name} preserves equal-item order as advertised`, () => {
      const input = [2, 1, 2, 1, 2, 1].map((value, i) => ({ id: `item-${i}`, value }));
      const expected = [...input].sort((a, b) => a.value - b.value);
      const final = runAlgorithm(name, input).at(-1).arr;
      expect(Array.from(final, (item) => item.id)).toEqual(expected.map((item) => item.id));
    });
  }
});
