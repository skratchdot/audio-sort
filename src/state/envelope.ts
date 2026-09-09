import { atom } from "jotai";

export type EnvelopeKey = "a" | "d" | "s" | "h" | "r";
export type Envelope = Readonly<Record<EnvelopeKey, number>>;
export const envelopeDefaults: Envelope = Object.freeze({ a: 50, d: 300, s: 0.5, h: 200, r: 300 });
const valuesAtom = atom(envelopeDefaults);
export const envelopeAtom = atom((get) => get(valuesAtom));
export const updateEnvelopeAtom = atom(
  null,
  (get, set, update: { key: EnvelopeKey; value: number }) => {
    const previous = get(valuesAtom);
    const value = update.key === "s" ? parseFloat(update.value.toFixed(2)) : update.value;
    if (!Number.isFinite(value) || (update.key === "s" ? value < 0 || value > 1 : value < 10)) {
      throw new RangeError("Expected a valid envelope level or duration");
    }
    if (!Object.is(previous[update.key], value)) {
      set(valuesAtom, Object.freeze({ ...previous, [update.key]: value }));
    }
  },
);
