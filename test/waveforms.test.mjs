import { expect, test, vi } from "vitest";
import { createStore } from "jotai/vanilla";
import { waveformDefaults, selectedWaveformAtom } from "../src/state/waveforms.ts";
import { envelopeDefaults, envelopeAtom, updateEnvelopeAtom } from "../src/state/envelope.ts";
import { updateSettingAtom } from "../src/state/settings.ts";
import { createAudioSettings } from "../src/audio/audio-settings.ts";
import { getEnvelopePoints, formatEnvelopeValue } from "../src/audio/envelope.ts";

test("all eight generators use the shared defaults, including string", () => {
  const store = createStore();
  expect(Object.keys(waveformDefaults)).toHaveLength(8);
  for (const id of Object.keys(waveformDefaults)) {
    store.set(updateSettingAtom, { key: "waveform", value: id });
    expect(store.get(selectedWaveformAtom)).toEqual({
      ...waveformDefaults[id],
      a: 50,
      d: 300,
      s: 0.5,
      h: 200,
      r: 300,
    });
  }
  expect(waveformDefaults.string.gen).toBe("PluckGen");
  expect(waveformDefaults.pulse.mul).toBe(0.25);
  expect(waveformDefaults.saw.mul).toBe(0.25);
  expect(waveformDefaults.konami.mul).toBe(0.4);
});

test.each(["a", "d", "s", "h", "r"])(
  "shares edits to %s across every waveform without mutating defaults or other stores",
  (key) => {
    const store = createStore();
    const value = key === "s" ? 0.24 : 125;
    store.set(updateEnvelopeAtom, { key, value });
    for (const id of Object.keys(waveformDefaults)) {
      store.set(updateSettingAtom, { key: "waveform", value: id });
      expect(store.get(selectedWaveformAtom)[key]).toBe(value);
    }
    expect(createStore().get(envelopeAtom)).toEqual(envelopeDefaults);
    expect(Object.isFrozen(store.get(envelopeAtom))).toBe(true);
  },
);

test("no-op edits and unrelated settings do not notify audio subscribers", () => {
  const store = createStore();
  const listener = vi.fn();
  const stop = store.sub(selectedWaveformAtom, listener);
  store.set(updateEnvelopeAtom, { key: "s", value: 0.501 });
  store.set(updateSettingAtom, { key: "tempo", value: 150 });
  expect(listener).not.toHaveBeenCalled();
  store.set(updateEnvelopeAtom, { key: "s", value: 0.237 });
  expect(store.get(envelopeAtom).s).toBe(0.24);
  expect(listener).toHaveBeenCalledTimes(1);
  stop();
});

test.each([
  ["s", -1],
  ["s", 2],
  ["a", 0],
  ["h", NaN],
  ["r", Infinity],
])("rejects invalid %s value %s", (key, value) => {
  expect(() => createStore().set(updateEnvelopeAtom, { key, value })).toThrow(RangeError);
});

test("audio getters combine the current generator with the shared envelope", () => {
  const store = createStore();
  const controller = createAudioSettings(store);
  store.set(updateEnvelopeAtom, { key: "a", value: 100 });
  store.set(updateSettingAtom, { key: "waveform", value: "sin" });
  expect(controller.getSelectedWaveformInfo()).toMatchObject({ gen: "OscGen", a: 100 });
  store.set(updateSettingAtom, { key: "waveform", value: "string" });
  expect(controller.getSelectedWaveformInfo()).toMatchObject({ gen: "PluckGen", a: 100 });
});

test("diagram holds at sustain level after decay, with a proportional time axis", () => {
  expect(getEnvelopePoints(envelopeDefaults)).toEqual([
    [0, 0],
    [50, 1],
    [350, 0.5],
    [550, 0.5],
    [850, 0],
  ]);
  expect(getEnvelopePoints({ ...envelopeDefaults, s: 0 })[3]).toEqual([550, 0]);
  expect(getEnvelopePoints({ ...envelopeDefaults, s: 1 })[3]).toEqual([550, 1]);
  expect(formatEnvelopeValue("a", 50)).toBe("50 ms");
  expect(formatEnvelopeValue("h", 1500)).toBe("1.5 s");
  expect(formatEnvelopeValue("s", 0.5)).toBe("50%");
});
