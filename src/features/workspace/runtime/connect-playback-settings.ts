import type { createStore } from "jotai/vanilla";
import { settingsAtom } from "../../../state/settings.ts";
import { waveformDefaults } from "../../../state/waveforms.ts";
import { playbackPreferencesAtom } from "../../../state/playback-preferences.ts";

type Store = ReturnType<typeof createStore>;
type Preferences = ReturnType<typeof playbackPreferencesAtom.read>;
type Effects = {
  volume: (value: number, gain: number) => void;
  tempo: (value: number) => void;
  preferences: (value: Preferences) => void;
};

// Audio/DOM ownership stays with the caller; this connection owns subscriptions only.
export function connectPlaybackSettings(store: Store, effects: Effects): () => void {
  let previousSettings: ReturnType<typeof settingsAtom.read> | undefined;
  let previousPreferences: Preferences | undefined;
  const sync = () => {
    const settings = store.get(settingsAtom);
    const preferences = store.get(playbackPreferencesAtom);
    const previous = previousSettings;
    const oldPreferences = previousPreferences;
    previousSettings = settings;
    previousPreferences = preferences;
    if (
      !previous ||
      previous.volume !== settings.volume ||
      previous.waveform !== settings.waveform
    ) {
      effects.volume(settings.volume, settings.volume * waveformDefaults[settings.waveform].mul);
    }
    if (!previous || previous.tempo !== settings.tempo) effects.tempo(settings.tempo);
    if (oldPreferences !== preferences) effects.preferences(preferences);
  };
  const unsubscribeSettings = store.sub(settingsAtom, sync);
  const unsubscribePreferences = store.sub(playbackPreferencesAtom, sync);
  const disconnect = () => {
    unsubscribeSettings();
    unsubscribePreferences();
  };
  try {
    sync();
  } catch (error) {
    disconnect();
    throw error;
  }
  return disconnect;
}
