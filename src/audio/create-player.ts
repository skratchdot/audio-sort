import type { AudioSettings } from "./audio-settings";
import type { createSoundfont } from "./create-soundfont";
import type { PlayerState } from "../state/players";
import type { SortFrame } from "../sorting/sort-types";
import type { VisualizationType } from "../visualizations/visualization-types";

type Options = {
  settings: AudioSettings;
  getMidiNumber: (value: number) => number;
  soundfont: ReturnType<typeof createSoundfont>;
  isLooping: () => boolean;
  onUpdate: (state: PlayerState) => void;
};
import { createTimbreAudio } from "./create-timbre-audio.ts";
import { createTransport } from "./create-transport.ts";
import { timbre } from "./timbre.ts";
import { visualizations } from "../visualizations/visualization-types.ts";
import { createMidiBytes } from "../midi/create-midi-bytes.ts";
import { drawStringPreview } from "./string-preview.ts";

// Owns transport and audio resources; React renders the published chart data.
export function createPlayer({ settings, getMidiNumber, soundfont, isLooping, onUpdate }: Options) {
  let data: SortFrame[] = [];
  let renderer: VisualizationType = "bar";
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
      audio.playFrame(data[index]!);
      draw();
    },
  });
  audio.refresh();
  const setVisualization = (name: VisualizationType) => {
    if (!Object.hasOwn(visualizations, name)) return;
    renderer = name;
    draw();
  };
  return {
    setData(value: SortFrame[]) {
      if (disposed) return;
      data = value;
      transport.setLength(data.length);
      draw();
    },
    setVisualization,
    seek(value: number) {
      transport.seek(value);
      draw();
    },
    async action(action: string) {
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
    plot(canvas: HTMLCanvasElement | null) {
      if (!canvas) return;
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      if (settings.getSelected("waveform") === "string") drawStringPreview(canvas);
      else audio.plot({ target: canvas, background: "rgba(255,255,255,0)" });
    },
    getMidiBytes: (tempo: number, channel: number, instrument: number) =>
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
