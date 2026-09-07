import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { createStore } from "jotai/vanilla";
import { Workspace } from "./ui/workspace.tsx";
import { createWorkspace } from "./ui/create-workspace.mjs";

const store = createStore();
let runtime;
let root;
const mount = () => {
  runtime = createWorkspace(store);
  root = createRoot(document.getElementById("workspace"));
  root.render(createElement(Workspace, { runtime }));
};
mount();
const onPageHide = (event) => {
  if (event.persisted) runtime?.suspend();
  else {
    root?.unmount();
    root = runtime = null;
  }
};
const onPageShow = (event) => {
  if (!event.persisted) return;
  if (runtime) runtime.resume();
  else mount();
};
globalThis.addEventListener("pagehide", onPageHide);
globalThis.addEventListener("pageshow", onPageShow);
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    globalThis.removeEventListener("pagehide", onPageHide);
    globalThis.removeEventListener("pageshow", onPageShow);
    root?.unmount();
  });
