import { generators } from "./generators/generator-registry.mjs";
import { createSortController } from "./ui/create-sort-controller.mjs";
import { algorithms } from "./sorting/algorithm-registry.mjs";
import { sources } from "./sorting/algorithm-sources.mjs";
import { createSortRequest, getFunctionBody, runSortRequest } from "./sorting/sort-requests.mjs";

function createSortWorker() {
  return new Worker(new URL("./worker.mjs", import.meta.url), { type: "module" });
}

const controller = createSortController(generators);
controller.init({
  loadCodeEditor: () => import("./ui/create-code-editor.mjs"),
  createWorker: createSortWorker,
  algorithms: { ...algorithms },
  createSortRequest,
  runSortRequest,
  getSource(id, algorithm) {
    return getFunctionBody(algorithm === algorithms[id] ? sources[id] : algorithm);
  },
});
