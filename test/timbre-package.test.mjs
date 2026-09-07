import { createHash } from "node:crypto";
import { expect, test, vi } from "vitest";
import timbre from "timbre/timbre.dev.js";

// Captured from the previous deployed 14.06.23 bundle before removing it.
// These are DSP regression fingerprints, not an assertion of audible equivalence.
test.each([
  ["adshr", "5c5ff1843b2cbd81f3b548314378b2c8eda2c54600712903b5815bc35b915011"],
  ["pluck", "a98a0dc3bbf7a94ab1831aabf953839d5f68dba82669c0bac8fbb8cbbcb612ae"],
])("packaged %s preserves the previous deterministic sample output", (kind, expected) => {
  let seed = 1;
  vi.spyOn(Math, "random").mockImplementation(() => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  });
  const node = timbre(
    kind,
    kind === "adshr" ? { a: 50, d: 300, s: 0.5, h: 200, r: 300 } : { freq: 440 },
  ).bang();
  const samples = [];
  for (let tick = 1; tick <= 700; tick++) {
    node.process(tick);
    samples.push(...node.cells[0]);
  }
  expect(createHash("sha256").update(JSON.stringify(samples)).digest("hex")).toBe(expected);
});

test("uses the pinned browser entry without Node audio dependencies", () => {
  expect(timbre.version).toBe("14.11.25");
  for (const wave of ["sin", "cos", "pulse", "tri", "saw", "fami", "konami"]) {
    const node = timbre(wave);
    node.process(1);
    expect(Array.from(node.cells[0]).every(Number.isFinite)).toBe(true);
  }
});
