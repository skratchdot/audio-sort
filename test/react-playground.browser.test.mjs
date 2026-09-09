// cspell:words unstub
import { afterEach, expect, test, vi } from "vitest";
import { createElement } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { Provider, createStore, useAtomValue, useSetAtom } from "jotai";
import { usePlayers } from "../src/hooks/use-players.ts";
import { useSort } from "../src/hooks/use-sort.ts";
import { settingsAtom, updateSettingAtom } from "../src/state/settings.ts";
import { updateEnvelopeAtom } from "../src/state/envelope.ts";
import { editAlgorithmAtom, algorithmCatalogAtom } from "../src/state/algorithm-overrides.ts";
import { toggleAutoPlayAtom } from "../src/state/playback-preferences.ts";
import { playerAtoms, sortErrorAtom, suspendedAtom } from "../src/state/players.ts";
import { createPlayer } from "../src/audio/create-player.mjs";
import { createTimbreSoundfont } from "../src/audio/create-timbre-soundfont.mjs";

vi.mock("../src/audio/timbre.mjs", () => ({ timbre: {} }));
vi.mock("../src/audio/create-player.mjs", () => ({
  createPlayer: vi.fn(() => ({
    destroy: vi.fn(),
    suspend: vi.fn(),
    refresh: vi.fn(),
    plot: vi.fn(),
    setVolume: vi.fn(),
    setTempo: vi.fn(),
    setVisualization: vi.fn(),
    setData: vi.fn(),
    seek: vi.fn(),
    isPlaying: vi.fn(() => false),
    action: vi.fn(),
  })),
}));
vi.mock("../src/audio/create-timbre-soundfont.mjs", () => ({
  createTimbreSoundfont: vi.fn(() => ({
    setInstrument: vi.fn(),
    preload: vi.fn(),
    pause: vi.fn(),
    dispose: vi.fn(),
  })),
}));
const workers = [];
class TestWorker {
  listeners = {};
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    workers.push(this);
  }
  addEventListener(type, callback) {
    this.listeners[type] = callback;
  }
  reply(data) {
    this.listeners.message({ data: { key: this.postMessage.mock.calls[0][0].key, ...data } });
  }
}
function wrapper(store) {
  return ({ children }) => createElement(Provider, { store }, children);
}
function setup(strict = false) {
  vi.stubGlobal("Worker", TestWorker);
  const store = createStore();
  const hook = renderHook(
    () => {
      const session = usePlayers(null);
      const actions = useSort(session);
      return { session, actions };
    },
    { wrapper: wrapper(store), reactStrictMode: strict },
  );
  return { store, ...hook };
}
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  workers.length = 0;
});

test("React providers isolate state and hooks update only their own tree", () => {
  const useSettings = () => ({
    value: useAtomValue(settingsAtom),
    update: useSetAtom(updateSettingAtom),
  });
  const first = renderHook(useSettings, { wrapper: wrapper() });
  const second = renderHook(useSettings, { wrapper: wrapper() });
  act(() => first.result.current.update({ key: "tempo", value: 180 }));
  expect(first.result.current.value.tempo).toBe(180);
  expect(second.result.current.value.tempo).toBe(90);
});

test("Strict Mode recreates disposed resources and unmount cancels the active worker", () => {
  const { result, unmount } = setup(true);
  const sessions = createTimbreSoundfont.mock.results.map(({ value }) => value);
  expect(sessions.length).toBeGreaterThanOrEqual(2);
  expect(sessions[0].dispose).toHaveBeenCalledTimes(1);
  const session = result.current.session;
  expect(session.soundfont.dispose).not.toHaveBeenCalled();
  const worker = workers.at(-1);
  unmount();
  expect(worker.terminate).toHaveBeenCalled();
  for (const player of Object.values(session.players))
    expect(player.destroy).toHaveBeenCalledTimes(1);
  expect(session.soundfont.dispose).toHaveBeenCalledTimes(1);
});

test("audio effects track their inputs without restarting sorts", () => {
  const { store, result } = setup();
  const { players, soundfont } = result.current.session;
  const requestCount = workers.length;
  const refreshCount = players.base.refresh.mock.calls.length;
  act(() => store.set(updateSettingAtom, { key: "volume", value: 0 }));
  expect(players.base.setVolume).toHaveBeenLastCalledWith(0);
  expect(players.base.refresh).toHaveBeenCalledTimes(refreshCount);
  act(() => store.set(updateSettingAtom, { key: "tempo", value: 150 }));
  expect(players.sort.setTempo).toHaveBeenLastCalledWith("bpm150 l16");
  act(() => store.set(updateEnvelopeAtom, { key: "a", value: 100 }));
  expect(players.base.refresh).toHaveBeenCalledTimes(refreshCount + 1);
  expect(workers).toHaveLength(requestCount);
  expect(soundfont.preload).not.toHaveBeenCalled();
  act(() => store.set(updateSettingAtom, { key: "audioType", value: "soundfont" }));
  expect(soundfont.setInstrument).toHaveBeenLastCalledWith(0);
  expect(soundfont.preload).toHaveBeenCalledTimes(1);
  act(() => store.set(updateSettingAtom, { key: "centerNote", value: 72 }));
  expect(soundfont.preload).toHaveBeenCalledTimes(2);
  expect(workers).toHaveLength(requestCount);
});

test("sorting reacts to selected algorithm edits, ignores unrelated catalog changes, and rejects stale replies", () => {
  const { store, result } = setup();
  const old = workers.at(-1);
  const count = workers.length;
  act(() => store.set(editAlgorithmAtom, { id: "insertion", source: "AS.play(0);" }));
  expect(workers).toHaveLength(count);
  act(() => store.set(editAlgorithmAtom, { id: "bubble", source: "AS.play(0);" }));
  expect(workers).toHaveLength(count + 1);
  expect(old.terminate).toHaveBeenCalled();
  const current = workers.at(-1);
  expect(current.postMessage.mock.calls[0][0].type).toBe("custom");
  act(() => old.reply({ error: "stale error" }));
  expect(store.get(sortErrorAtom)).toBe("");
  act(() => current.reply({ error: "current error" }));
  expect(store.get(sortErrorAtom)).toBe("current error");
  expect(result.current.session.players.sort.setData).not.toHaveBeenCalled();
  expect(store.get(algorithmCatalogAtom).bubble).toBeDefined();
});

test("edits debounce work, cancel on suspension, and resume without autoplay", () => {
  vi.useFakeTimers();
  const { store, result } = setup();
  const count = workers.length;
  act(() => result.current.actions.edit(0, 4));
  act(() => result.current.actions.edit(0, 5));
  expect(workers).toHaveLength(count);
  act(() => vi.advanceTimersByTime(250));
  expect(workers).toHaveLength(count + 1);
  expect(workers.at(-1).postMessage.mock.calls[0][0].arr[0]).toBe(5);
  act(() => {
    store.set(toggleAutoPlayAtom);
    globalThis.dispatchEvent(new Event("pagehide"));
    store.set(suspendedAtom, true);
  });
  const { players, soundfont } = result.current.session;
  expect(players.base.suspend).toHaveBeenCalled();
  expect(soundfont.pause).toHaveBeenCalled();
  expect(workers.at(-1).terminate).toHaveBeenCalled();
  act(() => store.set(updateSettingAtom, { key: "sort", value: "insertion" }));
  act(() => store.set(suspendedAtom, false));
  act(() => vi.advanceTimersByTime(250));
  act(() => workers.at(-1).reply({ frames: [] }));
  expect(players.sort.action).not.toHaveBeenCalled();
  act(() => result.current.actions.select("insertion"));
  act(() => vi.advanceTimersByTime(250));
  act(() => workers.at(-1).reply({ frames: [] }));
  expect(players.sort.action).toHaveBeenCalledWith("play");
});

test("player callbacks publish into atoms without a parallel snapshot store", () => {
  const { store, unmount } = setup();
  const options = createPlayer.mock.calls.at(-1)[0];
  const next = { ...store.get(playerAtoms.sort), position: 3, playing: true };
  act(() => options.onUpdate(next));
  expect(store.get(playerAtoms.sort)).toBe(next);
  unmount();
  act(() => options.onUpdate(next));
  expect(store.get(playerAtoms.sort).frames).toHaveLength(0);
  expect(store.get(playerAtoms.sort).playing).toBe(false);
});
