import { algorithms } from "./algorithm-registry.ts";
import { createSortEngine } from "./create-sort-engine.ts";
import type {
  SortAlgorithm,
  SortInput,
  SortRequest,
  SortResult,
  SortResponse,
} from "./sort-types.ts";

const builtins: Readonly<Record<string, SortAlgorithm>> = algorithms;

export function getFunctionBody(fn: SortAlgorithm | string) {
  const source = String(fn).trim();
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  return start === -1 || end <= start ? source : source.slice(start + 1, end);
}

export function createSortRequest(
  key: unknown,
  id: string,
  algorithm: SortAlgorithm,
  arr: SortInput[],
): SortRequest {
  if (Object.hasOwn(builtins, id) && algorithm === builtins[id]) {
    return { key, type: "builtin", id, arr };
  }
  return { key, type: "custom", source: getFunctionBody(algorithm), arr };
}

// Shared by the real worker and the no-Worker fallback. Only editor code needs
// dynamic compilation; built-ins execute their imported implementation directly.
export function runSortRequest(input: unknown, engine = createSortEngine()): SortResult {
  if (!input || typeof input !== "object" || !("arr" in input) || !Array.isArray(input.arr))
    throw new TypeError("Expected a sort array");
  // The transport is untrusted. Keep the existing envelope checks at runtime;
  // item/index validity remains the algorithm API's caller responsibility.
  const request = input as Record<string, unknown> & { arr: SortInput[] };
  let algorithm: SortAlgorithm;
  if (request.type === "builtin") {
    if (typeof request.id !== "string" || !Object.hasOwn(builtins, request.id))
      throw new Error("Unknown algorithm ID");
    algorithm = builtins[request.id]!;
  } else if (request.type === "custom") {
    if (typeof request.source !== "string") throw new TypeError("Expected custom source");
    algorithm = new Function("AS", request.source) as SortAlgorithm;
  } else {
    throw new Error("Unknown sort request type");
  }
  const token = Symbol("sort");
  engine.init(request.arr, token);
  algorithm(engine);
  return { key: request.key, frames: engine.end(token) };
}

// Convert execution failures into cloneable worker responses.
export function handleSortRequest(data: unknown): SortResponse {
  try {
    return runSortRequest(data);
  } catch (error) {
    const key = data && typeof data === "object" && "key" in data ? data.key : undefined;
    const message =
      error && typeof error === "object" && "message" in error ? error.message : error;
    return { key, error: String(message ?? error) };
  }
}
