import type { createPlayground } from "./create-playground.mjs";
export type PlayerId = "base" | "sort";
export type Props = { runtime: ReturnType<typeof createPlayground> };
