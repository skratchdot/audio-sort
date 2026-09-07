import { expect, test, vi } from "vitest";
import { createStore } from "jotai/vanilla";
import {
  playbackPreferencesAtom,
  toggleAutoPlayAtom,
  toggleLoopAtom,
} from "../src/js/state/playback-preferences.ts";

test("playback preferences preserve defaults and are isolated by store and player", () => {
  const store = createStore();
  const original = store.get(playbackPreferencesAtom);
  expect(original).toEqual({ autoPlay: false, loop: { base: true, sort: true } });
  store.set(toggleLoopAtom, "base");
  expect(store.get(playbackPreferencesAtom)).toEqual({
    autoPlay: false,
    loop: { base: false, sort: true },
  });
  store.set(toggleLoopAtom, "sort");
  store.set(toggleAutoPlayAtom);
  const next = store.get(playbackPreferencesAtom);
  expect(next).toEqual({ autoPlay: true, loop: { base: false, sort: false } });
  expect(original).toEqual(createStore().get(playbackPreferencesAtom));
  expect(Object.isFrozen(next)).toBe(true);
  expect(Object.isFrozen(next.loop)).toBe(true);
  store.set(toggleLoopAtom, "base");
  store.set(toggleLoopAtom, "sort");
  store.set(toggleAutoPlayAtom);
  expect(store.get(playbackPreferencesAtom)).toEqual(original);
});

test("toggle notifications can be unsubscribed", () => {
  const store = createStore();
  const listener = vi.fn();
  const unsubscribe = store.sub(playbackPreferencesAtom, listener);
  store.set(toggleAutoPlayAtom);
  store.set(toggleLoopAtom, "sort");
  expect(listener).toHaveBeenCalledTimes(2);
  unsubscribe();
  store.set(toggleLoopAtom, "base");
  expect(listener).toHaveBeenCalledTimes(2);
});
