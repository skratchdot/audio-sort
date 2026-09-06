import { generators } from "./fn/registry.mjs";
import { createSortController } from "./A.Sort.mjs";
import { algorithms } from "./sort/registry.mjs";
import { sources } from "./sort/sources.mjs";
import { createSortRequest, getFunctionBody, runSortRequest } from "./sort/requests.mjs";

function createSortWorker() {
  return new Worker(new URL("./worker.mjs", import.meta.url), { type: "module" });
}

const controller = createSortController(generators);
controller.init({
  createWorker: createSortWorker,
  algorithms: { ...algorithms },
  createSortRequest,
  runSortRequest,
  getSource(id, algorithm) {
    return getFunctionBody(algorithm === algorithms[id] ? sources[id] : algorithm);
  },
});
