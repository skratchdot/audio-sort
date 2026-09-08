import type { createStore } from "jotai/vanilla";
import { settingsAtom, type Settings } from "../state/settings.ts";
import { selectedWaveformAtom, type Waveform } from "../state/waveforms.ts";

type Effects = {
  render: (settings: Settings, waveform: Waveform) => void;
  refreshWaveform: () => void;
  setInstrument: (instrument: number) => void;
  preload: () => void;
};

// Separate from transport: this connection never starts/stops a player or sorts data.
export function connectAudioSettings(store: ReturnType<typeof createStore>, effects: Effects) {
  let previous: Settings | undefined;
  let previousWaveform: Waveform | undefined;
  const sync = () => {
    const settings = store.get(settingsAtom);
    const waveform = store.get(selectedWaveformAtom);
    const old = previous;
    const waveformChanged = waveform !== previousWaveform;
    const typeChanged = !old || old.audioType !== settings.audioType;
    const instrumentChanged = !old || old.soundfont !== settings.soundfont;
    const pitchChanged =
      !old || old.scale !== settings.scale || old.centerNote !== settings.centerNote;
    previous = settings;
    previousWaveform = waveform;
    if (waveformChanged || typeChanged || instrumentChanged || pitchChanged) {
      effects.render(settings, waveform);
    }
    // The legacy soundfont extension can be absent in no-Worker browsers.
    // Waveform mode must not require it just to initialize the application.
    if (settings.audioType === "soundfont" && (instrumentChanged || typeChanged)) {
      effects.setInstrument(settings.soundfont);
    }
    if (waveformChanged || (typeChanged && settings.audioType === "waveform")) {
      effects.refreshWaveform();
    }
    if (settings.audioType === "soundfont" && (typeChanged || instrumentChanged || pitchChanged)) {
      effects.preload();
    }
  };
  const unsubscribeSettings = store.sub(settingsAtom, sync);
  const unsubscribeWaveforms = store.sub(selectedWaveformAtom, sync);
  const disconnect = () => {
    unsubscribeSettings();
    unsubscribeWaveforms();
  };
  try {
    sync();
  } catch (error) {
    disconnect();
    throw error;
  }
  return disconnect;
}
