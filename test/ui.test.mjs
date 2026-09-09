import { expect, test } from "vitest";
import { createHelpers } from "../src/midi/create-helpers.mjs";
import { createPlayer } from "../src/audio/create-player.mjs";
import { visualizations } from "../src/visualizations/visualization-types.ts";

test("UI modules import without DOM initialization or first-party globals", () => {
  for (const name of ["A", "visualization"]) expect(Object.hasOwn(globalThis, name)).toBe(false);
  expect(typeof createPlayer).toBe("function");
  expect(Object.keys(visualizations).sort()).toEqual(["bar", "flat"]);
  for (const name of ["A", "visualization"]) expect(Object.hasOwn(globalThis, name)).toBe(false);
});

test("MIDI helper reads current settings from its injected settings", () => {
  const selected = { scale: "test", dataSize: 8, centerNote: 60 };
  const helpers = createHelpers(
    { getSelected: (key) => selected[key] },
    {
      scales: {
        test: { pitchesPerOctave: 12, degrees: [0, 2, 4, 5, 7, 9, 11] },
      },
    },
  );
  expect(helpers.getMidiNumber(4)).toBe(60);
  expect(helpers.getMidiNumber(0)).toBe(53);
  expect(helpers.getMidiNumber(7)).toBe(65);
  selected.centerNote = 72;
  expect(helpers.getMidiNumber(4)).toBe(72);
});
