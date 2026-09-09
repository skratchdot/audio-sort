import { min, max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { generators, type GeneratorId } from "../generators/generator-registry";
import { defaults } from "../state/settings";
import type { SortFrame } from "./sort-types";

export function generateInput(action: GeneratorId, size: number) {
  const values = generators[action](size);
  const full = generators[action](defaults.dataSize.max);
  const slice = full.slice(0, size);
  const scale = scaleLinear()
    .domain([0, size - 1])
    .range([min(slice)!, max(slice)!]);
  values.forEach((value, i) => {
    full[i] = Math.round(scale(value));
  });
  return { values, full, edited: false };
}

export function resizeInput(full: number[], size: number) {
  const slice = full.slice(0, size);
  const scale = scaleLinear()
    .domain([min(slice)!, max(slice)!])
    .range([0, size - 1]);
  return slice.map((value) => Math.round(scale(value)));
}

export function previewFrames(values: number[]): SortFrame[] {
  return values.map((_, index) => ({
    arr: values.map((value, i) => ({
      id: i,
      value,
      play: i === index,
      mark: false,
      swap: false,
      justSwapped: false,
      compare: false,
      highlight: false,
    })),
    compareCount: 0,
    swapCount: 0,
  }));
}
