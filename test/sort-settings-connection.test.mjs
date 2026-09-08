import { expect, test, vi } from "vitest";
import { createStore } from "jotai/vanilla";
import { connectSortSettings } from "../src/ui/connect-sort-settings.ts";
import { updateSettingAtom } from "../src/state/settings.ts";
import { addAlgorithmAtom, editAlgorithmAtom } from "../src/state/algorithm-overrides.ts";

const createEffects = () => ({
  catalog: vi.fn(),
  selection: vi.fn(),
  size: vi.fn(),
  sort: vi.fn(),
});
const clear = (effects) => Object.values(effects).forEach((effect) => effect.mockClear());

test("initial connection renders catalog, selection and size before sorting", () => {
  const store = createStore();
  const effects = createEffects();
  const stop = connectSortSettings(store, effects);
  expect(effects.selection).toHaveBeenCalledExactlyOnceWith("bubble");
  expect(effects.size).toHaveBeenCalledExactlyOnceWith(12, false);
  expect(effects.sort).toHaveBeenCalledExactlyOnceWith(false);
  expect(effects.size.mock.invocationCallOrder[0]).toBeLessThan(
    effects.sort.mock.invocationCallOrder[0],
  );
  stop();
});

test("selection, selected edits and resizing trigger one sort; unrelated changes do not", () => {
  const store = createStore();
  const effects = createEffects();
  const stop = connectSortSettings(store, effects);
  clear(effects);
  store.set(updateSettingAtom, { key: "sort", value: "insertion" });
  expect(effects.sort).toHaveBeenCalledExactlyOnceWith(true);
  store.set(editAlgorithmAtom, { id: "insertion", source: "AS.play(0);" });
  expect(effects.sort).toHaveBeenCalledTimes(2);
  store.set(addAlgorithmAtom, { id: "new", name: "New", source: "" });
  store.set(editAlgorithmAtom, { id: "bubble", source: "" });
  store.set(updateSettingAtom, { key: "volume", value: 0.5 });
  expect(effects.sort).toHaveBeenCalledTimes(2);
  expect(effects.catalog).toHaveBeenCalledTimes(3);
  store.set(updateSettingAtom, { key: "dataSize", value: 24 });
  expect(effects.size).toHaveBeenCalledExactlyOnceWith(24, true);
  expect(effects.sort).toHaveBeenCalledTimes(3);
  expect(effects.sort).toHaveBeenLastCalledWith(false);
  stop();
});

test("disconnect removes both subscriptions and reconnect catches up", () => {
  const store = createStore();
  const effects = createEffects();
  const stop = connectSortSettings(store, effects);
  stop();
  stop();
  clear(effects);
  store.set(updateSettingAtom, { key: "dataSize", value: 24 });
  store.set(editAlgorithmAtom, { id: "bubble", source: "" });
  for (const effect of Object.values(effects)) expect(effect).not.toHaveBeenCalled();
  const disconnect = connectSortSettings(store, effects);
  expect(effects.size).toHaveBeenCalledExactlyOnceWith(24, false);
  expect(effects.sort).toHaveBeenCalledTimes(1);
  disconnect();
});

test("initial effect failures release subscriptions", () => {
  const store = createStore();
  const effects = createEffects();
  effects.catalog.mockImplementation(() => {
    throw new Error("not mounted");
  });
  expect(() => connectSortSettings(store, effects)).toThrow("not mounted");
  store.set(updateSettingAtom, { key: "dataSize", value: 24 });
  expect(effects.size).not.toHaveBeenCalled();
});
