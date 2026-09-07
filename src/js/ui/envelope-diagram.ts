import type { Envelope, EnvelopeKey } from "../state/envelope.ts";

export function formatEnvelopeValue(key: EnvelopeKey, value: number): string {
  if (key === "s") return `${Math.round(value * 100)}%`;
  return value < 1000 ? `${value} ms` : `${Number((value / 1000).toFixed(3))} s`;
}

// Verified against public/js/timbre.dev.js, register("adshr"):
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

export function drawEnvelopeDiagram(svg: SVGElement, e: Envelope) {
  const points = getEnvelopePoints(e);
  const total = e.a + e.d + e.h + e.r;
  const coords = points.map(([time, level]) => `${40 + (time / total) * 340},${155 - level * 125}`);
  const sustainY = 155 - e.s * 125;
  svg.setAttribute(
    "aria-label",
    `Amplitude envelope: attack ${formatEnvelopeValue("a", e.a)}, decay ${formatEnvelopeValue("d", e.d)}, sustain ${formatEnvelopeValue("s", e.s)} for ${formatEnvelopeValue("h", e.h)}, release ${formatEnvelopeValue("r", e.r)}.`,
  );
  svg.innerHTML = `
    <line class="envelope-grid" x1="40" y1="30" x2="380" y2="30" />
    <line class="envelope-grid" x1="40" y1="155" x2="380" y2="155" />
    <line class="envelope-sustain" x1="40" y1="${sustainY}" x2="380" y2="${sustainY}" />
    <text x="32" y="34" text-anchor="end">100%</text>
    <text x="32" y="159" text-anchor="end">0%</text>
    <polyline class="envelope-curve" points="${coords.join(" ")}" />
    <text x="40" y="175">0</text>
    <text x="380" y="175" text-anchor="end">${formatEnvelopeValue("r", total)}</text>
    <text x="210" y="18" text-anchor="middle">Level over time · sustain ${formatEnvelopeValue("s", e.s)}</text>
    ${(["a", "d", "h", "r"] as const).map((key, index) => `<text x="${40 + index * 85}" y="199">${{ a: "Attack", d: "Decay", h: "Hold", r: "Release" }[key]}</text><text x="${40 + index * 85}" y="216">${formatEnvelopeValue(key, e[key])}</text>`).join("")}
  `;
}
