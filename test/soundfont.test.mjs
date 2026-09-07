import { expect, test, vi } from "vitest";
import { createSoundfont, soundfontUrl } from "../src/js/audio/create-soundfont.ts";

function setup(overrides = {}) {
  const sample = { play: vi.fn(), pause: vi.fn(), dispose: vi.fn() };
  const options = {
    fetchSample: vi
      .fn()
      .mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }),
    decode: vi.fn().mockResolvedValue({}),
    createSample: vi.fn().mockReturnValue(sample),
    onError: vi.fn(),
    ...overrides,
  };
  return { font: createSoundfont(options), sample, ...options };
}

test("loads the original sample URLs once and never plays a late note", async () => {
  const { font, sample, fetchSample } = setup();
  font.play(60, 0.375);
  await font.preload([60, 60]);
  expect(fetchSample).toHaveBeenCalledTimes(1);
  expect(fetchSample.mock.calls[0][0]).toBe(soundfontUrl(0, 60));
  expect(sample.play).not.toHaveBeenCalled();
  font.play(60, 0.375);
  expect(sample.play).toHaveBeenCalledExactlyOnceWith(0.375);
});

test("instrument caches are separate and old in-flight loads cannot change selection", async () => {
  const { font, fetchSample } = setup();
  const old = font.preload([60]);
  font.setInstrument(42);
  await Promise.all([old, font.preload([60])]);
  expect(fetchSample.mock.calls.map(([url]) => url)).toEqual([
    soundfontUrl(0, 60),
    soundfontUrl(42, 60),
  ]);
  font.setInstrument(0);
  await font.preload([60]);
  expect(fetchSample).toHaveBeenCalledTimes(2);
});

test("failed requests and native decode errors can be retried", async () => {
  const { font, fetchSample, decode, onError } = setup();
  fetchSample.mockRejectedValueOnce(new Error("offline"));
  await font.preload([60]);
  decode.mockRejectedValueOnce(new Error("invalid audio"));
  await font.preload([60]);
  await font.preload([60]);
  expect(fetchSample).toHaveBeenCalledTimes(3);
  expect(onError).toHaveBeenCalledTimes(2);
});

test("HTTP errors do not enter the cache", async () => {
  const { font, fetchSample, decode } = setup();
  fetchSample.mockResolvedValueOnce({ ok: false, status: 404 });
  await font.preload([60]);
  expect(decode).not.toHaveBeenCalled();
  await font.preload([60]);
  expect(decode).toHaveBeenCalledTimes(1);
});

test("synchronous fetch failures can also be retried", async () => {
  const { font, fetchSample } = setup();
  fetchSample.mockImplementationOnce(() => {
    throw new Error("fetch unavailable");
  });
  await font.preload([60]);
  await font.preload([60]);
  expect(fetchSample).toHaveBeenCalledTimes(2);
});

test("stalled fetches are aborted after ten seconds", async () => {
  vi.useFakeTimers();
  try {
    const { font, fetchSample, onError } = setup({
      fetchSample: vi.fn(
        (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new Error("aborted")));
          }),
      ),
    });
    const pending = font.preload([60]);
    await vi.advanceTimersByTimeAsync(10000);
    await pending;
    expect(fetchSample.mock.calls[0][1].signal.aborted).toBe(true);
    expect(onError).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});

test("disposal aborts downloads and prevents late decoder completion from creating nodes", async () => {
  let resolve;
  const { font, fetchSample, createSample } = setup({
    decode: () =>
      new Promise((done) => {
        resolve = done;
      }),
  });
  const pending = font.preload([60]);
  await vi.waitFor(() => expect(resolve).toBeTypeOf("function"));
  font.dispose();
  resolve({});
  await pending;
  expect(fetchSample.mock.calls[0][1].signal.aborted).toBe(true);
  expect(createSample).not.toHaveBeenCalled();
});

test("pause retains cache, disposal releases nodes once, invalid notes are ignored", async () => {
  const { font, sample, fetchSample } = setup();
  await font.preload([60, -1, 128, NaN]);
  font.pause();
  font.play(60, 1);
  expect(sample.pause).toHaveBeenCalledTimes(1);
  expect(fetchSample).toHaveBeenCalledTimes(1);
  font.dispose();
  font.dispose();
  font.play(60, 1);
  expect(sample.dispose).toHaveBeenCalledTimes(1);
  expect(sample.play).toHaveBeenCalledTimes(1);
});
