import { atom } from "jotai";
import type { SortFrame } from "../sorting/sort-types";
import type { VisualizationType } from "../visualizations/visualization-types";

export type PlayerId = "base" | "sort";
export type PlayerState = {
  frames: SortFrame[];
  renderer: VisualizationType;
  position: number;
  length: number;
  compare: number;
  compareMax: number;
  swap: number;
  swapMax: number;
  playing: boolean;
};
export const emptyPlayer: PlayerState = {
  frames: [],
  renderer: "bar",
  position: 0,
  length: 0,
  compare: 0,
  compareMax: 0,
  swap: 0,
  swapMax: 0,
  playing: false,
};
export const playerAtoms = { base: atom(emptyPlayer), sort: atom(emptyPlayer) };
export const suspendedAtom = atom(false);
export const sortErrorAtom = atom("");
export const visualizationAtom = atom<VisualizationType>("bar");

// Records every hide, even when React batches a hide/show pair.
export const pageLifecycleAtom = atom(0);
