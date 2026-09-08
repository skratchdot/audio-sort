import { useEffect, useState } from "react";
import { createStore } from "jotai/vanilla";
import { SortingPlayground } from "./sorting-playground.tsx";
import { createPlayground } from "../../controllers/create-playground.mjs";

const store = createStore();
type Runtime = ReturnType<typeof createPlayground>;

export function BrowserPlayground() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  useEffect(() => {
    let current: Runtime | null = null;
    const mount = () => {
      current = createPlayground(store);
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
  return runtime ? <SortingPlayground runtime={runtime} /> : null;
}
