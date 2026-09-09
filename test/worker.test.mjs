import { createSortEngine } from "../src/sorting/create-sort-engine.ts";
import { describe, expect, test, vi } from "vitest";
import { algorithms } from "../src/sorting/algorithm-registry.ts";
import { sources } from "../src/sorting/algorithm-sources.ts";
import {
  createSortRequest,
  getFunctionBody,
  runSortRequest,
} from "../src/sorting/sort-requests.ts";
import { algorithmNames, seededValues } from "./helpers/algorithms.mjs";

function run(request) {
  return runSortRequest(request);
}

test("default requests get fresh engines even after custom code mutates its API", () => {
  const request = {
    key: 1,
    type: "custom",
    source: "AS.swap = () => { throw new Error('leaked API'); }; AS.highlight(0);",
    arr: [
      { id: "a", value: 2 },
      { id: "b", value: 1 },
    ],
  };
  const first = runSortRequest(request);
  const snapshot = structuredClone(first);
  const second = runSortRequest({ key: 2, type: "builtin", id: "bubble", arr: request.arr });
  expect(second.frames.at(-1).arr.map((item) => item.value)).toEqual([1, 2]);
  expect(second.frames.flatMap((frame) => frame.arr).some((item) => item.highlight)).toBe(false);
  expect(first).toEqual(snapshot);
});

test("registry and editor sources cover every algorithm module", () => {
  expect(Object.keys(algorithms).sort()).toEqual(algorithmNames);
  expect(Object.keys(sources).sort()).toEqual(algorithmNames);
  expect(Object.isFrozen(algorithms)).toBe(true);
});

describe.each(algorithmNames)("%s worker request", (id) => {
  test("sends only a built-in ID and executes without dynamic compilation", () => {
    const values = seededValues(16, 42);
    const original = [...values];
    const request = createSortRequest(0, id, algorithms[id], values);
    expect(request).toEqual({ key: 0, type: "builtin", id, arr: values });
    const engine = createSortEngine();
    const compile = vi.spyOn(globalThis, "Function").mockImplementation(() => {
      throw new Error("Built-ins must not compile source");
    });
    let result;
    try {
      result = runSortRequest(request, engine);
      expect(compile).not.toHaveBeenCalled();
    } finally {
      compile.mockRestore();
    }
    expect(result.key).toBe(0);
    expect(Array.from(result.frames.at(-1).arr, (item) => item.value)).toEqual(
      [...values].sort((a, b) => a - b),
    );
    expect(values).toEqual(original);
  });

  test("readable editor source still runs when saved as a custom edit", () => {
    const edited = new Function("AS", getFunctionBody(sources[id]));
    const request = createSortRequest("edit", id, edited, [3, 1, 2]);
    expect(request.type).toBe("custom");
    expect(Array.from(run(request).frames.at(-1).arr, (item) => item.value)).toEqual([1, 2, 3]);
  });
});

test.each(["function () {\nAS.play(0);\n}", "function anonymous(AS\n) {\nAS.play(0);\n}"])(
  "extracts custom function bodies: %s",
  (source) => {
    const result = run({
      key: "custom",
      type: "custom",
      source: getFunctionBody(source),
      arr: [1],
    });
    expect(result.key).toBe("custom");
    expect(result.frames.some((frame) => frame.arr[0].play)).toBe(true);
  },
);

test("empty custom code returns an empty frame", () => {
  expect(run({ type: "custom", source: "", arr: [] }).frames).toHaveLength(1);
});

test.each([
  { type: "builtin", id: "missing", arr: [] },
  { type: "builtin", id: "toString", arr: [] },
  { type: "builtin", id: "__proto__", arr: [] },
  { type: "other", arr: [] },
  { type: "custom", source: 42, arr: [] },
  { type: "custom", source: "invalid syntax !!!", arr: [] },
  { type: "custom", source: "throw new Error('custom failure')", arr: [] },
  { type: "builtin", id: "bubble", arr: null },
  null,
])("rejects malformed or failing requests: %j", (request) => {
  expect(() => run(request)).toThrow(/Expected|Unknown|Unexpected|custom failure/);
});

test("a failed request does not poison the next run", () => {
  const engine = createSortEngine();
  expect(() =>
    runSortRequest({ type: "custom", source: "throw new Error('failure')", arr: [4, 2] }, engine),
  ).toThrow("failure");
  const result = runSortRequest({ key: 2, type: "builtin", id: "bubble", arr: [2, 1] }, engine);
  expect(Array.from(result.frames.at(-1).arr, (item) => item.value)).toEqual([1, 2]);
});
