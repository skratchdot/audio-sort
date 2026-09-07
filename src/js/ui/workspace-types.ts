import type { createWorkspace } from "./create-workspace.mjs";
export type PlayerId = "base" | "sort";
export type Props = { runtime: ReturnType<typeof createWorkspace> };
