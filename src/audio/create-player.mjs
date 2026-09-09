import { createTimbreAudio } from "./create-timbre-audio.mjs";
import { createTransport } from "./create-transport.ts";
import { timbre } from "./timbre.mjs";
import { visualizations } from "../visualizations/visualization-types.ts";
import { createMidiBytes } from "../midi/create-midi-bytes.mjs";
import { drawStringPreview } from "./string-preview.ts";

// Owns transport and audio resources; React renders the published chart data.
export function createPlayer({ settings, getMidiNumber, soundfont, isLooping, onUpdate }) {
  let data = [];
  /** @type {import('../visualizations/visualization-types.ts').VisualizationType} */
  let renderer = "bar";
  let disposed = false;
  const audio = createTimbreAudio(
    timbre,
    settings,
    getMidiNumber,
    () => transport?.isPlaying() || false,
    soundfont,
  );
  const draw = () => {
    const position = transport.getPosition();
    const frame = data[position];
    onUpdate({
      position,
      frames: data,
      renderer,
      length: data.length,
      compare: frame?.compareCount || 0,
      compareMax: data.at(-1)?.compareCount || 0,
      swap: frame?.swapCount || 0,
      swapMax: data.at(-1)?.swapCount || 0,
      playing: transport.isPlaying(),
    });
  };
  const transport = createTransport({
    createClock: audio.createClock,
    isLooping,
    onStart: audio.start,
    onSuspend: audio.suspend,
    onFrame(index) {
      audio.playFrame(data[index]);
      draw();
    },
  });
  audio.refresh();
  /** @param {import('../visualizations/visualization-types.ts').VisualizationType} name */
  const setVisualization = (name) => {
    if (!Object.hasOwn(visualizations, name)) return;
    renderer = name;
    draw();
  };
  return {
    setData(value) {
      if (disposed) return;
      data = value;
      transport.setLength(data.length);
      draw();
    },
    setVisualization,
    seek(value) {
      transport.seek(value);
      draw();
    },
    async action(action) {
      await transport.whenReady(audio.resume(), () => {
        if (action === "stop") transport.stop();
        else if (action === "play" || action === "reverse") transport.play(action === "reverse");
        else transport.seek(action === "goToFirst" ? 0 : data.length - 1);
        draw();
      });
    },
    isPlaying: transport.isPlaying,
    stop() {
      transport.stop();
      draw();
    },
    suspend() {
      transport.suspend();
      draw();
    },
    setTempo: transport.setTempo,
    setVolume: audio.setVolume,
    refresh: audio.refresh,
    plot(canvas) {
      if (!canvas) return;
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      if (settings.getSelected("waveform") === "string") drawStringPreview(canvas);
      else audio.plot({ target: canvas, background: "rgba(255,255,255,0)" });
    },
    getMidiBytes: (tempo, channel, instrument) =>
      createMidiBytes(data, getMidiNumber, tempo, channel, instrument),
    destroy() {
      if (disposed) return;
      disposed = true;
      transport.dispose();
      audio.dispose();
      data = [];
    },
  };
}
