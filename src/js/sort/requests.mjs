import { algorithms } from "./registry.mjs";
import { createSortEngine } from "../AS.mjs";

export function getFunctionBody(fn) {
  const source = String(fn).trim();
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  return start === -1 || end <= start ? source : source.slice(start + 1, end);
}

export function createSortRequest(key, id, algorithm, arr) {
  if (Object.hasOwn(algorithms, id) && algorithm === algorithms[id]) {
    return { key, type: "builtin", id, arr };
  }
  return { key, type: "custom", source: getFunctionBody(algorithm), arr };
}

// Shared by the real worker and the no-Worker fallback. Only editor code needs
// dynamic compilation; built-ins execute their imported implementation directly.
export function runSortRequest(request, engine = createSortEngine()) {
  if (!request || !Array.isArray(request.arr)) throw new TypeError("Expected a sort array");
  let algorithm;
  if (request.type === "builtin") {
    if (!Object.hasOwn(algorithms, request.id)) throw new Error("Unknown algorithm ID");
    algorithm = algorithms[request.id];
  } else if (request.type === "custom") {
    if (typeof request.source !== "string") throw new TypeError("Expected custom source");
    algorithm = new Function("AS", request.source);
  } else {
    throw new Error("Unknown sort request type");
  }
  const token = Symbol("sort");
  engine.init(request.arr, token);
  algorithm(engine);
  return { key: request.key, frames: engine.end(token) };
}
