import { useEffect, useState } from "react";
import type { ComponentType } from "react";

export function Home() {
  const [Workspace, setWorkspace] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // Audio/editor code is browser-only; never evaluate it during prerendering.
    void import("../features/workspace/browser-workspace.tsx")
      .then(({ BrowserWorkspace }) => {
        if (!cancelled) setWorkspace(() => BrowserWorkspace);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <main id="workspace">{Workspace && <Workspace />}</main>
      {failed && (
        <p className="mx-auto my-4 w-[calc(100%-2rem)] max-w-7xl" role="alert">
          Unable to load the workspace. Please reload the page to try again.
        </p>
      )}
      <noscript>
        <p className="mx-auto my-4 w-[calc(100%-2rem)] max-w-7xl">
          Enable JavaScript to listen to sorting algorithms.
        </p>
      </noscript>
    </>
  );
}
