import { expect, test, vi } from "vitest";
import { createStore } from "jotai/vanilla";
import { algorithms } from "../src/js/sorting/algorithm-registry.mjs";
import {
  algorithmCatalogAtom,
  editAlgorithmAtom,
  addAlgorithmAtom,
} from "../src/js/state/algorithm-overrides.ts";
import {
  createSortRequest,
  getFunctionBody,
  runSortRequest,
} from "../src/js/sorting/sort-requests.ts";

test("unmodified catalogs retain built-in identities and direct worker requests", () => {
  const catalog = createStore().get(algorithmCatalogAtom);
  expect(Object.keys(catalog)).toEqual(Object.keys(algorithms));
  for (const [id, algorithm] of Object.entries(algorithms)) {
    expect(catalog[id]).toBe(algorithm);
    expect(createSortRequest(1, id, catalog[id], [2, 1]).type).toBe("builtin");
  }
  expect(Object.isFrozen(catalog)).toBe(true);
});

test("edits preserve metadata and remain isolated from built-ins, previous snapshots, and other stores", () => {
  const store = createStore();
  const previous = store.get(algorithmCatalogAtom);
  const listener = vi.fn();
  const unsubscribe = store.sub(algorithmCatalogAtom, listener);
  store.set(editAlgorithmAtom, { id: "bubble", source: "AS.swap(0, 1);" });
  const edited = store.get(algorithmCatalogAtom).bubble;
  expect(edited).not.toBe(algorithms.bubble);
  expect({ ...edited }).toEqual({ ...algorithms.bubble });
  expect(previous.bubble).toBe(algorithms.bubble);
  expect(createStore().get(algorithmCatalogAtom).bubble).toBe(algorithms.bubble);
  expect(Object.isFrozen(edited)).toBe(true);
  const request = createSortRequest(1, "bubble", edited, [2, 1]);
  expect(request.type).toBe("custom");
  expect(getFunctionBody(edited)).toContain("AS.swap(0, 1)");
  expect(
    runSortRequest(request)
      .frames.at(-1)
      .arr.map((item) => item.value),
  ).toEqual([1, 2]);
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
  store.set(editAlgorithmAtom, { id: "bubble", source: "AS.play(0);" });
  expect(listener).toHaveBeenCalledTimes(1);
});

test("added algorithms can be edited without losing their display metadata", () => {
  const store = createStore();
  store.set(addAlgorithmAtom, { id: "custom", name: "My sort", source: "AS.swap(0, 1);" });
  expect({ ...store.get(algorithmCatalogAtom).custom }).toEqual({
    display: "My sort",
    stable: true,
    best: "",
    average: "",
    worst: "",
    memory: "",
    method: "",
  });
  store.set(editAlgorithmAtom, { id: "custom", source: "AS.play(0);" });
  const custom = store.get(algorithmCatalogAtom).custom;
  expect(custom.display).toBe("My sort");
  expect(getFunctionBody(custom)).toContain("AS.play(0)");
  expect(createStore().get(algorithmCatalogAtom)).not.toHaveProperty("custom");
  expect(Object.keys(store.get(algorithmCatalogAtom)).at(-1)).toBe("custom");
});

test("invalid source, missing edits, and duplicate IDs do not modify state", () => {
  const store = createStore();
  const previous = store.get(algorithmCatalogAtom);
  expect(() => store.set(editAlgorithmAtom, { id: "bubble", source: "(" })).toThrow(SyntaxError);
  expect(() => store.set(addAlgorithmAtom, { id: "custom", name: "Custom", source: "(" })).toThrow(
    SyntaxError,
  );
  expect(() => store.set(editAlgorithmAtom, { id: "missing", source: "" })).toThrow(
    "Unknown algorithm ID",
  );
  expect(() =>
    store.set(addAlgorithmAtom, { id: "bubble", name: "Duplicate", source: "" }),
  ).toThrow("Algorithm ID already exists");
  expect(store.get(algorithmCatalogAtom)).toBe(previous);
});
