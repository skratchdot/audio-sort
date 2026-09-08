import { atom } from "jotai/vanilla";
import { settingsAtom } from "./settings.ts";
import { envelopeAtom, type Envelope } from "./envelope.ts";

type Generator = Readonly<{ gen: "PluckGen" | "OscGen"; poly: number; mul: number }>;
export type Waveform = Generator & Envelope;
export const waveformDefaults = Object.freeze({
  string: Object.freeze({ gen: "PluckGen", poly: 10, mul: 1 }),
  sin: Object.freeze({ gen: "OscGen", poly: 10, mul: 1 }),
  cos: Object.freeze({ gen: "OscGen", poly: 10, mul: 1 }),
  pulse: Object.freeze({ gen: "OscGen", poly: 10, mul: 0.25 }),
  tri: Object.freeze({ gen: "OscGen", poly: 10, mul: 1 }),
  saw: Object.freeze({ gen: "OscGen", poly: 10, mul: 0.25 }),
  fami: Object.freeze({ gen: "OscGen", poly: 10, mul: 1 }),
  konami: Object.freeze({ gen: "OscGen", poly: 10, mul: 0.4 }),
} satisfies Record<string, Generator>);
export type WaveformId = keyof typeof waveformDefaults;

// Waveform changes select a generator; they never reset the shared envelope.
const selectedGeneratorAtom = atom((get) => waveformDefaults[get(settingsAtom).waveform]);
export const selectedWaveformAtom = atom<Waveform>((get) =>
  Object.freeze({
    ...get(selectedGeneratorAtom),
    ...get(envelopeAtom),
  }),
);
