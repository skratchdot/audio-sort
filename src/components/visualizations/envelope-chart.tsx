import { getEnvelopePoints, formatEnvelopeValue } from "../../audio/envelope";
import type { Envelope } from "../../state/envelope";

export function EnvelopeChart({ envelope: e }: { envelope: Envelope }) {
  const total = e.a + e.d + e.h + e.r;
  const points = getEnvelopePoints(e)
    .map(([time, level]) => `${40 + (time / Math.max(1, total)) * 340},${155 - level * 125}`)
    .join(" ");
  const sustainY = 155 - e.s * 125;
  return (
    <svg
      id="envelope-diagram"
      className="mb-2 h-16 w-full rounded-lg border bg-neutral-50"
      role="img"
      viewBox="35 25 350 135"
      preserveAspectRatio="none"
      aria-label={`Amplitude envelope: attack ${formatEnvelopeValue("a", e.a)}, decay ${formatEnvelopeValue("d", e.d)}, sustain ${formatEnvelopeValue("s", e.s)} for ${formatEnvelopeValue("h", e.h)}, release ${formatEnvelopeValue("r", e.r)}.`}
    >
      <line className="stroke-neutral-200" x1="40" y1="30" x2="380" y2="30" />
      <line className="stroke-neutral-200" x1="40" y1="155" x2="380" y2="155" />
      <line
        className="stroke-neutral-400"
        strokeDasharray="4 4"
        x1="40"
        y1={sustainY}
        x2="380"
        y2={sustainY}
      />
      <polyline
        className="envelope-curve fill-none stroke-sky-700"
        strokeWidth={2.5}
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
