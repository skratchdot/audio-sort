import { expect, test, vi } from "vitest";
import { createTransport } from "../src/js/audio/create-transport.ts";

function setup(length = 3) {
  let tick;
  let loop = false;
  const clock = { start: vi.fn(), stop: vi.fn(), setTempo: vi.fn(), dispose: vi.fn() };
  const frames = [];
  const onStart = vi.fn();
  const onSuspend = vi.fn();
  const transport = createTransport({
    createClock(callback) {
      tick = callback;
      return clock;
    },
    isLooping: () => loop,
    onFrame: (index) => frames.push(index),
    onStart,
    onSuspend,
  });
  transport.setLength(length);
  return {
    transport,
    clock,
    frames,
    onStart,
    onSuspend,
    tick: () => tick(),
    loop: () => {
      loop = true;
    },
  };
}

test("forward playback emits each frame once, stops at the end, and restarts", () => {
  const { transport, tick, frames } = setup();
  transport.play();
  tick();
  tick();
  tick();
  tick();
  expect(frames).toEqual([0, 1, 2]);
  expect(transport.isPlaying()).toBe(false);
  transport.play();
  tick();
  expect(frames).toEqual([0, 1, 2, 0]);
});

test("reverse starts at the end, loops, and reads live loop preferences", () => {
  const { transport, tick, frames, loop } = setup();
  transport.play(true);
  tick();
  tick();
  loop();
  tick();
  tick();
  expect(frames).toEqual([2, 1, 0, 2]);
  expect(transport.isPlaying()).toBe(true);
});

test("forward loops and single-frame data remain playable", () => {
  const { transport, tick, frames, loop } = setup(1);
  loop();
  transport.play();
  tick();
  tick();
  expect(frames).toEqual([0, 0]);
});

test("seeking and shorter replacement data clamp the position", () => {
  const { transport, tick, frames } = setup();
  transport.seek(100);
  expect(transport.getPosition()).toBe(2);
  transport.seek(-1);
  expect(transport.getPosition()).toBe(0);
  transport.play();
  tick();
  tick();
  transport.setLength(1);
  tick();
  expect(frames).toEqual([0, 1, 0]);
  expect(transport.isPlaying()).toBe(false);
});

test("empty data never starts audio or the clock, including looping", () => {
  const { transport, tick, frames, loop, clock, onStart } = setup(0);
  loop();
  transport.play();
  tick();
  expect(frames).toEqual([]);
  expect(clock.start).not.toHaveBeenCalled();
  expect(onStart).not.toHaveBeenCalled();
});

test("stop allows audio tails; suspension silences and retains position", () => {
  const { transport, tick, frames, onSuspend } = setup();
  transport.play();
  tick();
  transport.stop();
  tick();
  expect(frames).toEqual([0]);
  expect(onSuspend).not.toHaveBeenCalled();
  transport.suspend();
  expect(onSuspend).toHaveBeenCalledTimes(1);
  expect(transport.getPosition()).toBe(1);
});

test("tempo changes reach the injected clock without restarting playback", () => {
  const { transport, clock } = setup();
  transport.setTempo("bpm120 l16");
  expect(clock.setTempo).toHaveBeenCalledExactlyOnceWith("bpm120 l16");
  expect(clock.start).not.toHaveBeenCalled();
});

test.each(["suspend", "dispose"])("pending resume cannot run after %s", async (action) => {
  const { transport } = setup();
  let resolve;
  const pending = new Promise((done) => {
    resolve = done;
  });
  const callback = vi.fn();
  const ready = transport.whenReady(pending, callback);
  transport[action]();
  resolve();
  await ready;
  expect(callback).not.toHaveBeenCalled();
});

test("ready actions work before disposal; disposal releases the clock once", async () => {
  const { transport, clock, tick, frames } = setup();
  await transport.whenReady(Promise.resolve(), () => transport.play());
  expect(transport.isPlaying()).toBe(true);
  transport.dispose();
  transport.dispose();
  transport.play();
  tick();
  expect(clock.dispose).toHaveBeenCalledTimes(1);
  expect(transport.isPlaying()).toBe(false);
  expect(frames).toEqual([]);
});
