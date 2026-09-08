import { rgb } from "d3-color";
import { line } from "d3-shape";
import type { SortFrame, SortItem } from "../sorting/sort-types";

type Point = [number, number];
export type Trajectory = {
  id: SortItem["id"];
  dataColor: string;
  playColor: string;
  playIndexes: Set<number>;
  d: string;
};
type TrajectoryPoints = Omit<Trajectory, "d"> & { points: Point[] };

// Pure geometry: no DOM access. Calculate only when the recorded frames change.
export function createTrajectories(frames: readonly SortFrame[]): Trajectory[] {
  const items = frames.at(-1)?.arr ?? [];
  const half = Math.max(1, Math.floor(items.length / 2));
  const paths: TrajectoryPoints[] = items.map((item, index) => ({
    id: item.id,
    dataColor: rgb("steelblue")
      .darker((index - half) / half)
      .toString(),
    playColor: rgb("#c80000")
      .darker((index - half) / half)
      .toString(),
    playIndexes: new Set<number>(),
    points: [],
  }));
  const byId = new Map(paths.map((path) => [path.id, path]));
  frames.forEach((frame, time) => {
    frame.arr.forEach((item, index) => {
      const path = byId.get(item.id);
      if (!path) return;
      path.points.push([time, index + 0.5]);
      if (item.play) path.playIndexes.add(time);
    });
  });
  const toPath = line<Point>();
  return paths.reverse().map(({ points, ...path }) => ({ ...path, d: toPath(points) ?? "" }));
}
