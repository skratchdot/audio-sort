import { expect, test, vi } from "vitest";
import { createStore } from "jotai/vanilla";
import { defaults, settingsAtom, updateSettingAtom } from "../src/state/settings.ts";
import { createWorkspace } from "../src/features/workspace/runtime/create-workspace.mjs";

test("settings retain all nine existing defaults", () => {
  const store = createStore();
  expect(store.get(settingsAtom)).toEqual({
    volume: 0.25,
    tempo: 90,
    centerNote: 69,
    scale: "chromatic",
    sort: "bubble",
    dataSize: 12,
    audioType: "waveform",
    waveform: "string",
    soundfont: 0,
  });
  expect(defaults.tempo).toEqual({ value: 90, min: 20, max: 300, step: 1 });
  expect(defaults.dataSize).toEqual({ value: 12, min: 4, max: 48, step: 1 });
});

test("stores are isolated, snapshots immutable, and updates notify only on change", () => {
  const first = createStore();
  const second = createStore();
  const original = first.get(settingsAtom);
  const listener = vi.fn();
  const unsubscribe = first.sub(settingsAtom, listener);
  first.set(updateSettingAtom, { key: "tempo", value: 120 });
  expect(listener).toHaveBeenCalledTimes(1);
  expect(first.get(settingsAtom)).toEqual({ ...original, tempo: 120 });
  expect(original.tempo).toBe(90);
  expect(second.get(settingsAtom).tempo).toBe(90);
  expect(Object.isFrozen(first.get(settingsAtom))).toBe(true);
  first.set(updateSettingAtom, { key: "tempo", value: 120 });
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
  first.set(updateSettingAtom, { key: "tempo", value: 130 });
  expect(listener).toHaveBeenCalledTimes(1);
});

test("runtime audio settings getters read the current store, including falsy values and fallbacks", () => {
  const store = createStore();
  const controller = createWorkspace(store).settings;
  const independent = createWorkspace().settings;
  for (const [key, value] of Object.entries({
    volume: 0,
    tempo: 120,
    centerNote: 0,
    scale: "major",
    sort: "custom",
    dataSize: 24,
    audioType: "soundfont",
    waveform: "sin",
    soundfont: 42,
  })) {
    store.set(updateSettingAtom, { key, value });
    expect(controller.getSelected(key, "fallback")).toBe(value);
  }
  expect(controller.getTempoString()).toBe("bpm120 l16");
  expect(controller.getSelectedWaveformInfo().gen).toBe("OscGen");
  expect(controller.getSelected("missing", "fallback")).toBe("fallback");
  expect(controller.getSelected("toString", "fallback")).toBe("fallback");
  expect(independent.getSelected("tempo")).toBe(90);
});
