import { expect, test } from "vitest";
import { createSortController } from "../src/js/ui/create-sort-controller.mjs";
import { createHelpers } from "../src/js/ui/create-helpers.mjs";
import { createPlayerFactory } from "../src/js/ui/create-player-factory.mjs";
import { visualizations } from "../src/js/visualizations/visualization-registry.mjs";

test("UI modules import without DOM initialization or first-party globals", () => {
  for (const name of ["A", "visualization"]) expect(Object.hasOwn(globalThis, name)).toBe(false);
  const first = createSortController({});
  const second = createSortController({});
  expect(first).not.toBe(second);
  expect(typeof first.init).toBe("function");
  expect(first.getSelected("unknown", "fallback")).toBe("fallback");
  expect(typeof createPlayerFactory(first, {})).toBe("function");
  expect(Object.keys(visualizations).sort()).toEqual(["bar", "flat"]);
  for (const name of ["A", "visualization"]) expect(Object.hasOwn(globalThis, name)).toBe(false);
});

test("MIDI helper reads current settings from its injected controller", () => {
  const selected = { scale: "test", dataSize: 8, centerNote: 60 };
  const helpers = createHelpers(
    { getSelected: (key) => selected[key] },
    {
      sc: {
        ScaleInfo: {
          at: (name) => {
            expect(name).toBe("test");
            return { pitchesPerOctave: () => 12, degrees: () => [0, 2, 4, 5, 7, 9, 11] };
          },
        },
      },
    },
  );
  expect(helpers.getMidiNumber(4)).toBe(60);
  expect(helpers.getMidiNumber(0)).toBe(53);
  expect(helpers.getMidiNumber(7)).toBe(65);
  selected.centerNote = 72;
  expect(helpers.getMidiNumber(4)).toBe(72);
});
