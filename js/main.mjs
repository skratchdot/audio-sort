// Initialize legacy namespaces before loading the registration modules.
import "./fn/_fn.js";
import "./visualization/_visualization.js";
import "./_A.js";
import "./registrations.mjs";
import "./A.Helper.js";
import "./A.MidiExport.js";
import "./A.Player.js";
import "./A.Sort.js";
import "./A.instruments.js";
import { algorithms } from "./sort/registry.mjs";
import { sources } from "./sort/sources.mjs";
import { createSortRequest, getFunctionBody, runSortRequest } from "./sort/requests.mjs";

function createSortWorker() {
  return new Worker(new URL("./worker.mjs", import.meta.url), { type: "module" });
}

globalThis.A.Sort.init({
  createWorker: createSortWorker,
  algorithms: { ...algorithms },
  createSortRequest,
  runSortRequest,
  getSource(id, algorithm) {
    return getFunctionBody(algorithm === algorithms[id] ? sources[id] : algorithm);
  },
});
