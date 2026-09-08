import { createTimbreAudio } from "../../../audio/create-timbre-audio.mjs";
import { createTransport } from "../../../audio/create-transport.ts";
import { timbre } from "../../../vendor.mjs";
import { select } from "d3-selection";
import { visualizations } from "../../../visualizations/visualization-registry.mjs";
import { createMidiBytes } from "../../../midi/create-midi-bytes.mjs";
import { drawStringPreview } from "./string-preview.ts";

// Owns only the D3 SVG contents and audio resources. React owns all controls.
export function createWorkspacePlayer({
  svg,
  settings,
  getMidiNumber,
  soundfont,
  isLooping,
  onUpdate,
  onEdit,
}) {
  let data = [];
  let visualization;
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
    const frame = visualization?.draw(position);
    onUpdate({
      position,
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
  const events = new AbortController();
  if (onEdit) {
    for (const [event, method] of [
      ["pointermove", "onMouseMove"],
      ["pointerleave", "onMouseOut"],
      ["pointerdown", "onMouseDown"],
      ["pointerup", "onMouseUp"],
      ["pointercancel", "onMouseUp"],
    ]) {
      svg.addEventListener(
        event,
        (e) => {
          if (event === "pointerdown") svg.setPointerCapture(e.pointerId);
          visualization?.[method]?.(e);
        },
        { signal: events.signal },
      );
    }
  }
  const setVisualization = (name, reset = false) => {
    if (!Object.hasOwn(visualizations, name)) return;
    if (renderer === name && visualization?.setData && reset) visualization.setData(data);
    else if (renderer !== name || reset || !visualization) {
      renderer = name;
      svg.replaceChildren();
      visualization = visualizations[name]({
        data,
        svg: select(svg),
        hasMarkers: !onEdit,
        onClick: onEdit,
      });
    }
    draw();
  };
  return {
    setData(value) {
      if (disposed) return;
      data = value;
      transport.setLength(data.length);
      setVisualization(renderer, true);
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
      visualization?.onMouseUp?.();
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
      events.abort();
      transport.dispose();
      audio.dispose();
      svg.replaceChildren();
      data = [];
      visualization = null;
    },
  };
}
