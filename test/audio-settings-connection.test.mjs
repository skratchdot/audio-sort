import { expect, test, vi } from "vitest";
import { createStore } from "jotai/vanilla";
import { connectAudioSettings } from "../src/controllers/connect-audio-settings.ts";
import { updateSettingAtom } from "../src/state/settings.ts";
import { updateEnvelopeAtom } from "../src/state/envelope.ts";

const createEffects = () => ({
  render: vi.fn(),
  refreshWaveform: vi.fn(),
  setInstrument: vi.fn(),
  preload: vi.fn(),
});
const clear = (effects) => Object.values(effects).forEach((effect) => effect.mockClear());

test("waveform mode does not require the legacy soundfont extension", () => {
  const store = createStore();
  const effects = createEffects();
  effects.setInstrument.mockImplementation(() => {
    throw new Error("soundfont unavailable");
  });
  const disconnect = connectAudioSettings(store, effects);
  store.set(updateSettingAtom, { key: "soundfont", value: 42 });
  expect(effects.setInstrument).not.toHaveBeenCalled();
  expect(effects.preload).not.toHaveBeenCalled();
  disconnect();
});

test("initial synchronization applies the selected instrument before preloading", () => {
  const store = createStore();
  store.set(updateSettingAtom, { key: "audioType", value: "soundfont" });
  store.set(updateSettingAtom, { key: "soundfont", value: 42 });
  const effects = createEffects();
  const disconnect = connectAudioSettings(store, effects);
  expect(effects.render.mock.calls[0][0]).toMatchObject({ audioType: "soundfont", soundfont: 42 });
  expect(effects.setInstrument).toHaveBeenCalledExactlyOnceWith(42);
  expect(effects.preload).toHaveBeenCalledTimes(1);
  expect(effects.setInstrument.mock.invocationCallOrder[0]).toBeLessThan(
    effects.preload.mock.invocationCallOrder[0],
  );
  disconnect();
});

test("waveform and envelope changes refresh only the selected generator", () => {
  const store = createStore();
  const effects = createEffects();
  const disconnect = connectAudioSettings(store, effects);
  clear(effects);
  store.set(updateEnvelopeAtom, { key: "a", value: 100 });
  expect(effects.refreshWaveform).toHaveBeenCalledTimes(1);
  store.set(updateSettingAtom, { key: "waveform", value: "sin" });
  expect(effects.render.mock.calls[0][1].a).toBe(100);
  expect(effects.refreshWaveform).toHaveBeenCalledTimes(2);
  store.set(updateEnvelopeAtom, { key: "a", value: 200 });
  expect(effects.refreshWaveform).toHaveBeenCalledTimes(3);
  store.set(updateSettingAtom, { key: "tempo", value: 150 });
  store.set(updateSettingAtom, { key: "volume", value: 0.5 });
  expect(effects.refreshWaveform).toHaveBeenCalledTimes(3);
  expect(effects.preload).not.toHaveBeenCalled();
  disconnect();
});

test("pitch changes preload only in soundfont mode; switching to waveform refreshes audio", () => {
  const store = createStore();
  const effects = createEffects();
  const disconnect = connectAudioSettings(store, effects);
  clear(effects);
  store.set(updateSettingAtom, { key: "centerNote", value: 60 });
  expect(effects.render).toHaveBeenCalledTimes(1);
  expect(effects.preload).not.toHaveBeenCalled();
  store.set(updateSettingAtom, { key: "audioType", value: "soundfont" });
  store.set(updateSettingAtom, { key: "scale", value: "major" });
  store.set(updateSettingAtom, { key: "centerNote", value: 72 });
  expect(effects.preload).toHaveBeenCalledTimes(3);
  expect(effects.refreshWaveform).not.toHaveBeenCalled();
  store.set(updateSettingAtom, { key: "audioType", value: "waveform" });
  expect(effects.refreshWaveform).toHaveBeenCalledTimes(1);
  expect(effects.preload).toHaveBeenCalledTimes(3);
  disconnect();
});

test("disconnect releases both subscriptions and reconnect applies pending changes", () => {
  const store = createStore();
  const effects = createEffects();
  const disconnect = connectAudioSettings(store, effects);
  disconnect();
  disconnect();
  clear(effects);
  store.set(updateEnvelopeAtom, { key: "a", value: 200 });
  store.set(updateSettingAtom, { key: "centerNote", value: 60 });
  for (const effect of Object.values(effects)) expect(effect).not.toHaveBeenCalled();
  const stop = connectAudioSettings(store, effects);
  expect(effects.render.mock.calls[0][0].centerNote).toBe(60);
  expect(effects.render.mock.calls[0][1].a).toBe(200);
  stop();
});

test("failed initial synchronization releases subscriptions", () => {
  const store = createStore();
  const effects = createEffects();
  effects.render.mockImplementation(() => {
    throw new Error("not mounted");
  });
  expect(() => connectAudioSettings(store, effects)).toThrow("not mounted");
  clear(effects);
  store.set(updateSettingAtom, { key: "centerNote", value: 60 });
  store.set(updateEnvelopeAtom, { key: "a", value: 200 });
  expect(effects.render).not.toHaveBeenCalled();
});
