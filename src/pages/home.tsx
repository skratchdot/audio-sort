import { useEffect, useState } from "react";
import type { ComponentType } from "react";

export function Home() {
  const [Workspace, setWorkspace] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // Audio/editor code is browser-only; never evaluate it during prerendering.
    void import("../main.tsx")
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
        <p className="container" role="alert">
          Unable to load the workspace. Please reload the page to try again.
        </p>
      )}
      <noscript>
        <p className="container">Enable JavaScript to listen to sorting algorithms.</p>
      </noscript>
    </>
  );
}
