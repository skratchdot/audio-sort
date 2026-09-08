import { expect, test } from "vitest";
import { createTrajectories } from "../src/visualizations/create-trajectories.ts";

const frame = (arr) => ({ arr, compareCount: 0, swapCount: 0 });
test("trajectories track item identity across positions and duplicate values", () => {
  const frames = [
    frame([
      { id: "a", value: 0, play: true },
      { id: "b", value: 0 },
    ]),
    frame([
      { id: "b", value: 0, play: true },
      { id: "a", value: 0 },
    ]),
  ];
  const before = structuredClone(frames);
  const paths = createTrajectories(frames);
  expect(paths.map((path) => path.id)).toEqual(["a", "b"]);
  expect(paths[0].d).toBe("M0,0.5L1,1.5");
  expect(paths[1].d).toBe("M0,1.5L1,0.5");
  expect([...paths[0].playIndexes]).toEqual([0]);
  expect([...paths[1].playIndexes]).toEqual([1]);
  expect(frames).toEqual(before);
});

test("empty and single-item trajectories have finite geometry and colors", () => {
  expect(createTrajectories([])).toEqual([]);
  const [path] = createTrajectories([frame([{ id: 0, value: 0 }])]);
  expect(path.d).toMatch(/^M0,0.5/);
  expect(path.d + path.dataColor + path.playColor).not.toMatch(/NaN|Infinity/);
});
