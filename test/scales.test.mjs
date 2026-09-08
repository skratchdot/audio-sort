import { createHash } from "node:crypto";
import { expect, test } from "vitest";
import { scales } from "../src/midi/scales.ts";
import { createHelpers } from "../src/features/workspace/runtime/create-helpers.mjs";

test("preserves all scale data extracted from the bundled subcollider 0.1.0", () => {
  // Baseline computed from ScaleInfo.names()/at() in the original bundle.
  expect(Object.keys(scales)).toHaveLength(108);
  expect(createHash("sha256").update(JSON.stringify(scales)).digest("hex")).toBe(
    "88f6f663e6dcbb21c56b7acaf57fdb65cce23c773dffaa1727b5c2c638c7457b",
  );
  expect([...new Set(Object.values(scales).map((scale) => scale.pitchesPerOctave))]).toEqual([
    12, 24, 43,
  ]);
});

test("scale data cannot be changed by consumers", () => {
  expect(Object.isFrozen(scales)).toBe(true);
  for (const scale of Object.values(scales)) {
    expect(Object.isFrozen(scale)).toBe(true);
    expect(Object.isFrozen(scale.degrees)).toBe(true);
  }
});

test("all scales retain the existing centered note mapping", () => {
  for (const [id, scale] of Object.entries(scales)) {
    const selected = { scale: id, dataSize: 12, centerNote: 60 };
    const helper = createHelpers({ getSelected: (key) => selected[key] });
    const noteAt = (position) =>
      scale.degrees[position % scale.degrees.length] +
      Math.floor(position / scale.degrees.length) * scale.pitchesPerOctave;
    for (let position = 0; position < 12; position++) {
      expect(helper.getMidiNumber(position)).toBe(noteAt(position) + 60 - noteAt(6));
    }
  }
});
