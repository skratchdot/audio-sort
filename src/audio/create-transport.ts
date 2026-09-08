export type PlaybackClock = {
  start: () => void;
  stop: () => void;
  setTempo: (tempo: string) => void;
  dispose: () => void;
};

type Options = {
  createClock: (tick: () => void) => PlaybackClock;
  isLooping: () => boolean;
  onFrame: (index: number) => void;
  onStart: () => void;
  onSuspend: () => void;
};

// Owns transport state and clock lifetime, but knows nothing about DOM, Jotai,
// Timbre, or frame contents. Audio tails may finish after stop; suspend silences.
export function createTransport(options: Options) {
  let length = 0;
  let index = 0;
  let playing = false;
  let reverse = false;
  let disposed = false;
  let generation = 0;
  const clamp = () => (index = Math.max(0, Math.min(index, length - 1)));
  const clock = options.createClock(() => {
    if (disposed || !playing) return;
    clamp();
    if (!length) {
      stop();
      return;
    }
    options.onFrame(index);
    index += reverse ? -1 : 1;
    if (index < 0 || index >= length) {
      if (options.isLooping()) index = reverse ? length - 1 : 0;
      else stop();
    }
  });

  function stop() {
    playing = false;
    clock.stop();
  }

  function suspend() {
    generation++;
    stop();
    options.onSuspend();
  }

  return {
    getPosition: clamp,
    isPlaying: () => playing,
    setLength(value: number) {
      if (disposed) return;
      length = Math.max(0, Math.trunc(value));
      clamp();
      if (!length) stop();
    },
    seek(value: number) {
      if (disposed || !Number.isFinite(value)) return;
      index = Math.trunc(value);
      clamp();
    },
    play(backwards = false) {
      if (disposed || !length) return;
      clock.stop();
      reverse = backwards;
      if (reverse && index <= 0) index = length - 1;
      else if (!reverse && index >= length - 1) index = 0;
      playing = true;
      options.onStart();
      clock.start();
    },
    stop,
    suspend,
    setTempo(tempo: string) {
      if (!disposed) clock.setTempo(tempo);
    },
    // A delayed AudioContext.resume must not revive a suspended/destroyed player.
    async whenReady(ready: Promise<unknown>, action: () => void) {
      const requestedGeneration = generation;
      await ready;
      if (!disposed && requestedGeneration === generation) action();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      suspend();
      clock.dispose();
      length = index = 0;
    },
  };
}
