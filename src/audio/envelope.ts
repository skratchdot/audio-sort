import type { Envelope, EnvelopeKey } from "../state/envelope.ts";

export function formatEnvelopeValue(key: EnvelopeKey, value: number): string {
  if (key === "s") return `${Math.round(value * 100)}%`;
  return value < 1000 ? `${value} ms` : `${Number((value / 1000).toFixed(3))} s`;
}

// Verified against timbre@14.11.25/timbre.dev.js, register("adshr"):
// [0, [1,a], [s,d], [s,h], [0,r]]. Hold is at sustain level AFTER decay,
// unlike an AHDSR peak hold before decay.
export function getEnvelopePoints(e: Envelope) {
  return [
    [0, 0],
    [e.a, 1],
    [e.a + e.d, e.s],
    [e.a + e.d + e.h, e.s],
    [e.a + e.d + e.h + e.r, 0],
  ] as const;
}
