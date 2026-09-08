import { expect, test, vi } from "vitest";
import { createStore } from "jotai/vanilla";
import { connectPlaybackSettings } from "../src/ui/connect-playback-settings.ts";
import { updateSettingAtom } from "../src/state/settings.ts";
import { toggleAutoPlayAtom, toggleLoopAtom } from "../src/state/playback-preferences.ts";

const createEffects = () => ({ volume: vi.fn(), tempo: vi.fn(), preferences: vi.fn() });

test("connection immediately applies current values, not just defaults", () => {
  const store = createStore();
  store.set(updateSettingAtom, { key: "tempo", value: 120 });
  store.set(updateSettingAtom, { key: "volume", value: 0.8 });
  store.set(updateSettingAtom, { key: "waveform", value: "pulse" });
  const effects = createEffects();
  const disconnect = connectPlaybackSettings(store, effects);
  expect(effects.tempo).toHaveBeenCalledExactlyOnceWith(120);
  expect(effects.volume).toHaveBeenCalledExactlyOnceWith(0.8, 0.2);
  expect(effects.preferences).toHaveBeenCalledExactlyOnceWith({
    autoPlay: false,
    loop: { base: true, sort: true },
  });
  disconnect();
});

test("direct writes apply the new tempo immediately and only invoke relevant effects", () => {
  const store = createStore();
  const effects = createEffects();
  const disconnect = connectPlaybackSettings(store, effects);
  for (const effect of Object.values(effects)) effect.mockClear();
  store.set(updateSettingAtom, { key: "tempo", value: 150 });
  expect(effects.tempo).toHaveBeenCalledExactlyOnceWith(150);
  store.set(updateSettingAtom, { key: "tempo", value: 150 });
  store.set(updateSettingAtom, { key: "scale", value: "major" });
  expect(effects.tempo).toHaveBeenCalledTimes(1);
  expect(effects.volume).not.toHaveBeenCalled();
  store.set(updateSettingAtom, { key: "volume", value: 0 });
  expect(effects.volume).toHaveBeenLastCalledWith(0, 0);
  store.set(updateSettingAtom, { key: "waveform", value: "pulse" });
  expect(effects.volume).toHaveBeenCalledTimes(2);
  store.set(toggleAutoPlayAtom);
  store.set(toggleLoopAtom, "sort");
  expect(effects.preferences).toHaveBeenLastCalledWith({
    autoPlay: true,
    loop: { base: true, sort: false },
  });
  disconnect();
});

test("disconnect is repeatable and reconnect catches up without retaining old callbacks", () => {
  const store = createStore();
  const effects = createEffects();
  const disconnect = connectPlaybackSettings(store, effects);
  disconnect();
  disconnect();
  for (const effect of Object.values(effects)) effect.mockClear();
  store.set(updateSettingAtom, { key: "tempo", value: 180 });
  store.set(toggleAutoPlayAtom);
  for (const effect of Object.values(effects)) expect(effect).not.toHaveBeenCalled();
  const next = createEffects();
  const stop = connectPlaybackSettings(store, next);
  expect(next.tempo).toHaveBeenCalledExactlyOnceWith(180);
  store.set(updateSettingAtom, { key: "tempo", value: 200 });
  expect(next.tempo).toHaveBeenCalledTimes(2);
  expect(effects.tempo).not.toHaveBeenCalled();
  stop();
});

test("failed initial synchronization releases its subscriptions", () => {
  const store = createStore();
  const effects = createEffects();
  effects.volume.mockImplementation(() => {
    throw new Error("audio unavailable");
  });
  expect(() => connectPlaybackSettings(store, effects)).toThrow("audio unavailable");
  store.set(updateSettingAtom, { key: "tempo", value: 150 });
  expect(effects.tempo).not.toHaveBeenCalled();
});
