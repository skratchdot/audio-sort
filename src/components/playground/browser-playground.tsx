import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { suspendedAtom, pageLifecycleAtom } from "../../state/players";
import { SortingPlayground } from "./sorting-playground";
import { PlaygroundProvider } from "./playground-context";

export function BrowserPlayground() {
  const [mounted, setMounted] = useState(true);
  const setLifecycle = useSetAtom(pageLifecycleAtom);
  const setSuspended = useSetAtom(suspendedAtom);
  useEffect(() => {
    setSuspended(false);
    const hide = (event: PageTransitionEvent) => {
      setSuspended(true);
      setLifecycle((value) => value + 1);
      if (!event.persisted) setMounted(false);
    };
    const show = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setSuspended(false);
      setMounted(true);
    };
    globalThis.addEventListener("pagehide", hide);
    globalThis.addEventListener("pageshow", show);
    return () => {
      globalThis.removeEventListener("pagehide", hide);
      globalThis.removeEventListener("pageshow", show);
    };
  }, [setSuspended, setLifecycle]);
  return mounted ? (
    <PlaygroundProvider>
      <SortingPlayground />
    </PlaygroundProvider>
  ) : null;
}
