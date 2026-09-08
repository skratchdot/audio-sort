import { expect, test, vi } from "vitest";
import { createTimbreAudio } from "../src/audio/create-timbre-audio.mjs";

function setup() {
  const nodes = [];
  const timbre = vi.fn((kind, options, callback) => {
    const node = {
      kind,
      options,
      callback,
      play: vi.fn(),
      pause: vi.fn(),
      noteOn: vi.fn(),
      set: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      removeAllListeners: vi.fn(),
      removeAll: vi.fn(),
      on: vi.fn(function () {
        return this;
      }),
    };
    nodes.push(node);
    return node;
  });
  timbre.fn = { _audioContext: { resume: vi.fn().mockResolvedValue(undefined) } };
  const selected = { audioType: "waveform", waveform: "string", volume: 0.25 };
  const wave = { gen: "PluckGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 };
  const settings = {
    getSelected: (key) => selected[key],
    getSelectedWaveformInfo: () => wave,
    getTempoString: () => "bpm90 l16",
  };
  const audio = createTimbreAudio(
    timbre,
    settings,
    (value) => value,
    () => false,
    { play: (...args) => timbre.soundfont.play(...args) },
  );
  audio.refresh();
  return { audio, timbre, nodes, selected, wave };
}

test("preserves envelope values, plucked generator, gain, and note velocity", () => {
  const { audio, nodes } = setup();
  expect(nodes[0].options).toEqual({ a: 50, d: 300, s: 0.5, h: 200, r: 300 });
  expect(nodes[1].kind).toBe("PluckGen");
  expect(nodes[1].options).toMatchObject({ poly: 10, mul: 0.25 });
  audio.playFrame({
    arr: [
      { play: true, value: 60 },
      { play: false, value: 61 },
      { play: true, value: -1 },
      { play: true, value: 128 },
      { play: true, value: NaN },
    ],
  });
  expect(nodes[1].noteOn).toHaveBeenCalledExactlyOnceWith(60, 64);
});

test("soundfont playback keeps gain and does not require the extension in waveform mode", () => {
  const { audio, timbre, selected } = setup();
  audio.start(); // No soundfont object needed.
  timbre.soundfont = { play: vi.fn() };
  selected.audioType = "soundfont";
  audio.playFrame({ arr: [{ play: true, value: 72 }] });
  expect(timbre.soundfont.play).toHaveBeenCalledExactlyOnceWith(72, 0.375);
});

test("switching to an oscillator releases old nodes and selects its waveform", () => {
  const { audio, nodes, selected, wave } = setup();
  selected.waveform = "sin";
  wave.gen = "OscGen";
  audio.refresh();
  expect(nodes[0].pause).toHaveBeenCalled();
  expect(nodes[1].removeAllListeners).toHaveBeenCalled();
  expect(nodes[3].kind).toBe("OscGen");
  expect(nodes[3].set).toHaveBeenCalledWith("osc", nodes[4]);
});

test("clock delegates to Timbre and audio disposal is idempotent", () => {
  const { audio, nodes } = setup();
  const tick = vi.fn();
  const clock = audio.createClock(tick);
  const interval = nodes[2];
  expect(interval.callback).toBe(tick);
  clock.start();
  clock.setTempo("bpm120 l16");
  clock.stop();
  clock.dispose();
  expect(interval.start).toHaveBeenCalledTimes(1);
  expect(interval.set).toHaveBeenCalledWith({ interval: "bpm120 l16" });
  expect(interval.removeAll).toHaveBeenCalledTimes(1);
  audio.dispose();
  audio.dispose();
  audio.playFrame({ arr: [{ play: true, value: 60 }] });
  expect(nodes[1].removeAll).toHaveBeenCalledTimes(1);
  expect(nodes[1].noteOn).not.toHaveBeenCalled();
});
