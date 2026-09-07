import { atom } from "jotai/vanilla";

export type EnvelopeKey = "a" | "d" | "s" | "h" | "r";
export type Waveform = Readonly<
  Record<EnvelopeKey, number> & {
    gen: "PluckGen" | "OscGen";
    poly: number;
    mul: number;
  }
>;

export const waveformDefaults = Object.freeze({
  string: Object.freeze({
    gen: "PluckGen",
    poly: 10,
    mul: 1,
    a: 50,
    d: 300,
    s: 0.5,
    h: 500,
    r: 2500,
  }),
  sin: Object.freeze({ gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 }),
  cos: Object.freeze({ gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 }),
  pulse: Object.freeze({
    gen: "OscGen",
    poly: 10,
    mul: 0.25,
    a: 50,
    d: 300,
    s: 0.5,
    h: 200,
    r: 300,
  }),
  tri: Object.freeze({ gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 }),
  saw: Object.freeze({ gen: "OscGen", poly: 10, mul: 0.25, a: 50, d: 300, s: 0.5, h: 200, r: 300 }),
  fami: Object.freeze({ gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 }),
  konami: Object.freeze({
    gen: "OscGen",
    poly: 10,
    mul: 0.4,
    a: 50,
    d: 300,
    s: 0.5,
    h: 200,
    r: 300,
  }),
} satisfies Record<string, Waveform>);

export type WaveformId = keyof typeof waveformDefaults;
type Waveforms = Readonly<Record<WaveformId, Waveform>>;
const valuesAtom = atom<Waveforms>(waveformDefaults);
export const waveformsAtom = atom((get) => get(valuesAtom));

// Only envelope parameters are editable; generator configuration stays fixed.
export const updateEnvelopeAtom = atom(
  null,
  (
    get,
    set,
    update: {
      waveform: WaveformId;
      key: EnvelopeKey;
      value: number;
    },
  ) => {
    const previous = get(valuesAtom);
    const current = previous[update.waveform];
    // Retain the UI's two-decimal sustain rounding.
    const value = update.key === "s" ? parseFloat(update.value.toFixed(2)) : update.value;
    if (Object.is(current[update.key], value)) return;
    set(
      valuesAtom,
      Object.freeze({
        ...previous,
        [update.waveform]: Object.freeze({ ...current, [update.key]: value }),
      }),
    );
  },
);
