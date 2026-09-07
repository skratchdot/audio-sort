import { generators } from "./generators/generator-registry.ts";
import { createSortController } from "./ui/create-sort-controller.mjs";
import { algorithms } from "./sorting/algorithm-registry.mjs";
import { sources } from "./sorting/algorithm-sources.mjs";
import { createSortRequest, getFunctionBody, runSortRequest } from "./sorting/sort-requests.ts";
import { createStore } from "jotai/vanilla";

function createSortWorker() {
  return new Worker(new URL("./worker.mjs", import.meta.url), { type: "module" });
}

const store = createStore();
let controller;
const mount = () => {
  controller = createSortController(generators, store);
  controller.init({
    loadCodeEditor: () => import("./ui/create-code-editor.mjs"),
    createWorker: createSortWorker,
    createSortRequest,
    runSortRequest,
    getSource(id, algorithm) {
      return getFunctionBody(algorithm === algorithms[id] ? sources[id] : algorithm);
    },
  });
};
mount();

// Release subscriptions while away; restore them when returning from the back/forward cache.
const onPageHide = (event) => {
  if (event.persisted) controller?.suspend();
  else {
    controller?.destroy();
    controller = null;
  }
};
const onPageShow = (event) => {
  if (!event.persisted) return;
  if (controller) controller.resume();
  else mount();
};
globalThis.addEventListener("pagehide", onPageHide);
globalThis.addEventListener("pageshow", onPageShow);
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    globalThis.removeEventListener("pagehide", onPageHide);
    globalThis.removeEventListener("pageshow", onPageShow);
    controller?.destroy();
  });
}
