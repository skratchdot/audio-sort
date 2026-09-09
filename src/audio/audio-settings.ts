import type { useStore } from "jotai";
import { settingsAtom, type Settings } from "../state/settings";
import { selectedWaveformAtom } from "../state/waveforms";

// Audio clock callbacks read current values without subscribing or owning a store.
export function createAudioSettings(store: ReturnType<typeof useStore>) {
  function getSelected<Key extends keyof Settings>(key: Key): Settings[Key];
  function getSelected(key: string, fallback?: unknown): unknown;
  function getSelected(key: string, fallback?: unknown) {
    const selected = store.get(settingsAtom);
    return Object.hasOwn(selected, key) ? selected[key as keyof Settings] : fallback;
  }
  return {
    getSelected,
    getSelectedWaveformInfo: () => store.get(selectedWaveformAtom),
    getTempoString: () => `bpm${store.get(settingsAtom).tempo} l16`,
  };
}

export type AudioSettings = ReturnType<typeof createAudioSettings>;
