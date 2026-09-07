// The legacy engine is injected here; this adapter has no DOM or store ownership.
// Keep its synthesis, timing, and soundfont gain unchanged during UI migration.
export function createTimbreAudio(timbre, settings, getMidiNumber, isPlaying, soundfont) {
  let env;
  let generator;
  let disposed = false;

  function suspend() {
    generator?.pause();
    env?.pause();
  }

  return {
    resume: () => timbre.fn._audioContext.resume(),
    createClock(tick) {
      const interval = timbre("interval", { interval: settings.getTempoString() }, tick);
      return {
        start: () => interval.start(),
        stop: () => interval.stop(),
        setTempo: (tempo) => interval.set({ interval: tempo }),
        dispose() {
          interval.removeAllListeners();
          interval.removeAll();
        },
      };
    },
    start() {
      if (!disposed && settings.getSelected("audioType") === "waveform") generator.play();
    },
    playFrame(frame) {
      if (disposed) return;
      const audioType = settings.getSelected("audioType");
      for (const item of frame.arr) {
        if (!item.play) continue;
        const midi = getMidiNumber(item.value);
        if (!(midi >= 0 && midi < 128)) continue;
        if (audioType === "waveform") generator.noteOn(midi, 64);
        else if (audioType === "soundfont") {
          soundfont.play(midi, settings.getSelected("volume") * 1.5);
        }
      }
    },
    setVolume(volume) {
      if (!disposed) generator.set({ mul: volume });
    },
    refresh() {
      if (disposed) return;
      const wave = settings.getSelectedWaveformInfo();
      for (const node of [env, generator]) {
        node?.pause();
        node?.removeAllListeners();
      }
      env = timbre("adshr", { a: wave.a, d: wave.d, s: wave.s, h: wave.h, r: wave.r });
      generator = timbre(wave.gen, {
        env,
        mul: settings.getSelected("volume") * wave.mul,
        poly: wave.poly || 10,
      }).on("ended", function () {
        if (!isPlaying()) this.pause();
      });
      if (wave.gen === "OscGen") generator.set("osc", timbre(settings.getSelected("waveform")));
      if (isPlaying() && settings.getSelected("audioType") === "waveform") generator.play();
    },
    plot(options) {
      generator?.osc?.plot(options);
    },
    suspend,
    dispose() {
      if (disposed) return;
      disposed = true;
      suspend();
      for (const node of [generator, env]) {
        node?.removeAllListeners();
        node?.removeAll();
      }
      generator = env = null;
    },
  };
}
