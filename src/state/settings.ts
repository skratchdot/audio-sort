import { atom } from "jotai";
import type { WaveformId } from "./waveforms.ts";

export type Settings = Readonly<{
  volume: number;
  tempo: number;
  centerNote: number;
  scale: string;
  sort: string;
  dataSize: number;
  audioType: "waveform" | "soundfont";
  waveform: WaveformId;
  soundfont: number;
}>;

// Slider bounds are configuration, not mutable application state.
export const defaults = Object.freeze({
  volume: Object.freeze({ value: 0.25, min: 0, max: 1, step: 0.01 }),
  tempo: Object.freeze({ value: 90, min: 20, max: 300, step: 1 }),
  centerNote: Object.freeze({ value: 69, min: 0, max: 127, step: 1 }),
  scale: Object.freeze({ value: "chromatic" }),
  sort: Object.freeze({ value: "bubble" }),
  dataSize: Object.freeze({ value: 12, min: 4, max: 48, step: 1 }),
  audioType: Object.freeze({ value: "waveform" as const }),
  waveform: Object.freeze({ value: "string" as const }),
  soundfont: Object.freeze({ value: 0 }),
});

const valuesAtom = atom<Settings>(
  Object.freeze({
    volume: defaults.volume.value,
    tempo: defaults.tempo.value,
    centerNote: defaults.centerNote.value,
    scale: defaults.scale.value,
    sort: defaults.sort.value,
    dataSize: defaults.dataSize.value,
    audioType: defaults.audioType.value,
    waveform: defaults.waveform.value,
    soundfont: defaults.soundfont.value,
  }),
);

// Expose read-only snapshots so consumers cannot silently bypass notifications.
export const settingsAtom = atom((get) => get(valuesAtom));
export type SettingUpdate = {
  [Key in keyof Settings]: { key: Key; value: Settings[Key] };
}[keyof Settings];

export const updateSettingAtom = atom(null, (get, set, { key, value }: SettingUpdate) => {
  const previous = get(valuesAtom);
  if (!Object.is(previous[key], value)) {
    set(valuesAtom, Object.freeze({ ...previous, [key]: value }));
  }
});
