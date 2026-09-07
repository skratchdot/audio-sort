import { createSoundfont } from "./create-soundfont.ts";

// Native decoding replaces JSONP and the bundled JS MP3 decoder. Continue routing
// samples through Timbre so they share the existing mixer with waveform playback.
export function createTimbreSoundfont(timbre) {
  return createSoundfont({
    decode: (bytes) => timbre.fn._audioContext.decodeAudioData(bytes),
    createSample(decoded) {
      const left = decoded.getChannelData(0);
      const right = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : left;
      const mix = Float32Array.from(left, (value, index) => (value + right[index]) / 2);
      const sample = timbre("buffer", {
        buffer: { samplerate: decoded.sampleRate, buffer: [mix, left, right] },
      }).on("ended", function () {
        this.pause();
      });
      // This legacy BufferNode setter copies buffers but omits the channel count.
      // Its audio decoder normally sets this field; preserve stereo here too.
      sample._.channels = Math.min(decoded.numberOfChannels, 2);
      return {
        play: (gain) => sample.set({ mul: gain }).play().bang(),
        pause: () => sample.pause(),
        dispose() {
          sample.pause();
          sample.removeAllListeners();
          sample.removeAll();
        },
      };
    },
    onError: (error) =>
      console.warn("Unable to load soundfont sample; a later request can retry.", error),
  });
}
