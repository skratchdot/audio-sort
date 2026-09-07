import { useEffect, useState } from "react";
import { createStore } from "jotai/vanilla";
import { Workspace } from "./ui/workspace.tsx";
import { createWorkspace } from "./ui/create-workspace.mjs";

const store = createStore();
type Runtime = ReturnType<typeof createWorkspace>;

export function BrowserWorkspace() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  useEffect(() => {
    let current: Runtime | null = null;
    const mount = () => {
      current = createWorkspace(store);
      setRuntime(current);
    };
    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) current?.suspend();
      else {
        current?.destroy();
        current = null;
        setRuntime(null);
      }
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (current) current.resume();
      else mount();
    };
    mount();
    globalThis.addEventListener("pagehide", onPageHide);
    globalThis.addEventListener("pageshow", onPageShow);
    return () => {
      globalThis.removeEventListener("pagehide", onPageHide);
      globalThis.removeEventListener("pageshow", onPageShow);
      current?.destroy();
    };
  }, []);
  return runtime ? <Workspace runtime={runtime} /> : null;
}
