type Sample = {
  play: (gain: number) => void;
  pause: () => void;
  dispose: () => void;
};
type Options = {
  decode: (data: ArrayBuffer) => Promise<AudioBuffer>;
  createSample: (buffer: AudioBuffer) => Sample;
  fetchSample?: typeof fetch;
  onError?: (error: unknown) => void;
};

// Preserve the original GeneralUser GS samples and numeric GM instrument mapping.
export function soundfontUrl(instrument: number, note: number) {
  return `https://projects.skratchdot.com/free-midi/channel/0/instrument/${instrument}/${note}.mp3`;
}

export function createSoundfont(options: Options) {
  let instrument = 0;
  let disposed = false;
  const samples = new Map<string, Sample>();
  const pending = new Map<string, Promise<void>>();
  const controllers = new Set<AbortController>();
  const valid = (value: number) => Number.isInteger(value) && value >= 0 && value < 128;

  async function load(note: number) {
    if (disposed || !valid(note)) return;
    const key = soundfontUrl(instrument, note);
    if (samples.has(key)) return;
    const existing = pending.get(key);
    if (existing) return existing;
    const controller = new AbortController();
    controllers.add(controller);
    const timeout = setTimeout(() => controller.abort(), 10000);
    const request = Promise.resolve().then(async () => {
      try {
        const response = await (options.fetchSample ?? fetch)(key, { signal: controller.signal });
        if (!response.ok) throw new Error(`Soundfont sample request failed: ${response.status}`);
        const buffer = await options.decode(await response.arrayBuffer());
        if (!disposed && !controller.signal.aborted) samples.set(key, options.createSample(buffer));
      } catch (error) {
        if (!disposed) options.onError?.(error);
      } finally {
        clearTimeout(timeout);
        controllers.delete(controller);
        pending.delete(key);
      }
    });
    pending.set(key, request);
    return request;
  }

  function pause() {
    for (const sample of samples.values()) sample.pause();
  }

  return {
    setInstrument(value: number) {
      if (!valid(value)) throw new RangeError("Expected a GM instrument from 0 to 127");
      instrument = value;
    },
    preload(notes: number[]) {
      return Promise.all([...new Set(notes)].map(load));
    },
    play(note: number, gain: number) {
      if (disposed || !valid(note)) return;
      const sample = samples.get(soundfontUrl(instrument, note));
      // Match the old play(note, false) behavior: load missing notes, but never
      // play them late when a network request finishes after their frame.
      if (sample) sample.play(gain);
      else void load(note);
    },
    pause,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const controller of controllers) controller.abort();
      for (const sample of samples.values()) sample.dispose();
      samples.clear();
      pending.clear();
    },
  };
}
