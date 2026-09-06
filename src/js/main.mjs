// Initialize the remaining legacy generator namespace before registration.
import "./fn/_fn.js";
import "./registrations.mjs";
import { createSortController } from "./A.Sort.mjs";
import { algorithms } from "./sort/registry.mjs";
import { sources } from "./sort/sources.mjs";
import { createSortRequest, getFunctionBody, runSortRequest } from "./sort/requests.mjs";

function createSortWorker() {
  return new Worker(new URL("./worker.mjs", import.meta.url), { type: "module" });
}

// The remaining generator registry is injected at the application boundary.
const controller = createSortController(globalThis.fn.datagen);
controller.init({
  createWorker: createSortWorker,
  algorithms: { ...algorithms },
  createSortRequest,
  runSortRequest,
  getSource(id, algorithm) {
    return getFunctionBody(algorithm === algorithms[id] ? sources[id] : algorithm);
  },
});
