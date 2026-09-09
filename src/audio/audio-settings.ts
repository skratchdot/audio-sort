import type { useStore } from "jotai";
import { settingsAtom } from "../state/settings";
import { selectedWaveformAtom } from "../state/waveforms";

// Audio clock callbacks read current values without subscribing or owning a store.
export function createAudioSettings(store: ReturnType<typeof useStore>) {
  return {
    getSelected(key: string, fallback?: unknown) {
      const selected = store.get(settingsAtom);
      return Object.hasOwn(selected, key) ? selected[key as keyof typeof selected] : fallback;
    },
    getSelectedWaveformInfo: () => store.get(selectedWaveformAtom),
    getTempoString: () => `bpm${store.get(settingsAtom).tempo} l16`,
  };
}
