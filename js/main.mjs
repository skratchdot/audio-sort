// Initialize legacy namespaces before loading the registration modules.
import "./fn/_fn.js";
import "./sort/_sort.js";
import "./visualization/_visualization.js";
import "./_A.js";
import "./registrations.mjs";
import "./AS.js";
import "./A.Helper.js";
import "./A.MidiExport.js";
import "./A.Player.js";
import "./A.Sort.js";
import "./A.instruments.js";

function createSortWorker() {
  return new Worker(new URL("./worker.mjs", import.meta.url), { type: "module" });
}

globalThis.A.Sort.init(createSortWorker);
