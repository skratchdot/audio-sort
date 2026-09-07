import { expect, test, vi } from "vitest";
import { createStore } from "jotai/vanilla";
import { waveformDefaults, waveformsAtom, updateEnvelopeAtom } from "../src/js/state/waveforms.ts";
import { updateSettingAtom } from "../src/js/state/settings.ts";
import { createSortController } from "../src/js/ui/create-sort-controller.mjs";

test("all eight waveform presets retain their original audio configuration", () => {
  const common = { gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 };
  expect(createStore().get(waveformsAtom)).toEqual({
    string: { ...common, gen: "PluckGen", h: 500, r: 2500 },
    sin: common,
    cos: common,
    pulse: { ...common, mul: 0.25 },
    tri: common,
    saw: { ...common, mul: 0.25 },
    fami: common,
    konami: { ...common, mul: 0.4 },
  });
});

test.each(["a", "d", "s", "h", "r"])(
  "updates %s without mutating defaults or other waveforms/stores",
  (key) => {
    const store = createStore();
    const original = store.get(waveformsAtom);
    const value = key === "s" ? 0.237 : 125;
    store.set(updateEnvelopeAtom, { waveform: "sin", key, value });
    const next = store.get(waveformsAtom);
    expect(next.sin).toEqual({ ...original.sin, [key]: key === "s" ? 0.24 : value });
    expect(next.string).toBe(original.string);
    expect(original).toEqual(waveformDefaults);
    expect(createStore().get(waveformsAtom)).toEqual(original);
    expect(Object.isFrozen(next)).toBe(true);
    expect(Object.isFrozen(next.sin)).toBe(true);
  },
);

test("rounded no-op edits do not notify; subscriptions can be removed", () => {
  const store = createStore();
  const listener = vi.fn();
  const unsubscribe = store.sub(waveformsAtom, listener);
  store.set(updateEnvelopeAtom, { waveform: "sin", key: "s", value: 0.501 });
  expect(listener).not.toHaveBeenCalled();
  store.set(updateEnvelopeAtom, { waveform: "sin", key: "s", value: 0.237 });
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
  store.set(updateEnvelopeAtom, { waveform: "sin", key: "a", value: 100 });
  expect(listener).toHaveBeenCalledTimes(1);
});

test("controller audio getters follow waveform selection and retain per-waveform edits", () => {
  const store = createStore();
  const controller = createSortController({}, store);
  store.set(updateEnvelopeAtom, { waveform: "string", key: "a", value: 100 });
  expect(controller.getSelectedWaveformInfo().a).toBe(100);
  store.set(updateSettingAtom, { key: "waveform", value: "sin" });
  expect(controller.getSelectedWaveformInfo().a).toBe(50);
  store.set(updateEnvelopeAtom, { waveform: "sin", key: "a", value: 200 });
  expect(controller.getSelectedWaveformInfo().a).toBe(200);
  store.set(updateSettingAtom, { key: "waveform", value: "string" });
  expect(controller.getSelectedWaveformInfo().a).toBe(100);
  expect(createSortController({}).getSelectedWaveformInfo().a).toBe(50);
});
