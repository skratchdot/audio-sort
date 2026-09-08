import { expect, test } from "vitest";
import { createWorkspace } from "../src/ui/create-workspace.mjs";
import { createHelpers } from "../src/ui/create-helpers.mjs";
import { createWorkspacePlayer } from "../src/ui/create-workspace-player.mjs";
import { visualizations } from "../src/visualizations/visualization-registry.mjs";

test("UI modules import without DOM initialization or first-party globals", () => {
  for (const name of ["A", "visualization"]) expect(Object.hasOwn(globalThis, name)).toBe(false);
  const first = createWorkspace();
  const second = createWorkspace();
  expect(first).not.toBe(second);
  expect(typeof first.mount).toBe("function");
  expect(first.settings.getSelected("unknown", "fallback")).toBe("fallback");
  expect(typeof createWorkspacePlayer).toBe("function");
  expect(Object.keys(visualizations).sort()).toEqual(["bar", "flat"]);
  for (const name of ["A", "visualization"]) expect(Object.hasOwn(globalThis, name)).toBe(false);
});

test("MIDI helper reads current settings from its injected controller", () => {
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

test("destroying an unmounted workspace is safe and prevents reuse", () => {
  const controller = createWorkspace();
  controller.destroy();
  controller.destroy();
  controller.resume();
  expect(() => controller.mount({})).toThrow("destroyed workspace");
});
