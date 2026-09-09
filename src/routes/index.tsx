import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";

function Home() {
  const [Playground, setPlayground] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // Audio/editor code is browser-only; never evaluate it during prerendering.
    void import("../components/playground/browser-playground.tsx")
      .then(({ BrowserPlayground }) => {
        if (!cancelled) setPlayground(() => BrowserPlayground);
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
      <main id="playground">{Playground && <Playground />}</main>
      {failed && (
        <p className="mx-auto my-4 w-[calc(100%-2rem)] max-w-7xl" role="alert">
          Unable to load the playground. Please reload the page to try again.
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

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    links: [
      {
        rel: "preload",
        as: "image",
        type: "image/webp",
        href: `${import.meta.env.BASE_URL}img/gradient_squares.webp`,
        fetchPriority: "high",
      },
    ],
  }),
});
