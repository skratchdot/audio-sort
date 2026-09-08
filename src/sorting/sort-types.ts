export type Marker = "play" | "mark" | "swap" | "compare" | "highlight";

export type SortItem = {
  id: string | number;
  value: number;
} & Partial<Record<Marker | "justSwapped", boolean>>;

// Numbers passed to operations are indices, not values.
export type SortReference = number | SortItem;
export type SortInput = number | SortItem;
export type SortFrame = { arr: SortItem[]; compareCount: number; swapCount: number };
type Compare = (one: SortReference, two: SortReference) => boolean;

export type SortApi = {
  length: () => number;
  size: () => number;
  get: (index: number) => SortItem;
  lt: Compare;
  lte: Compare;
  gt: Compare;
  gte: Compare;
  eq: Compare;
  neq: Compare;
  swap: (one: SortReference, two: SortReference) => void;
  play: (...items: SortReference[]) => void;
  mark: (...items: SortReference[]) => void;
  highlight: (...items: SortReference[]) => void;
  clearHighlight: () => void;
};

export type SortEngine = SortApi & {
  init: (input: readonly SortInput[], token: unknown) => void;
  end: (token: unknown) => SortFrame[];
  getFrames: () => SortFrame[];
};

export type SortAlgorithm = (engine: SortApi) => void;
export type SortRequest = { key?: unknown; arr: SortInput[] } & (
  | { type: "builtin"; id: string }
  | { type: "custom"; source: string }
);
export type SortResult = { key: unknown; frames: SortFrame[] };
export type SortResponse = SortResult | { key: unknown; error: string };
