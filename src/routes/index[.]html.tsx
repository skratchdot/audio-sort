import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/index.html")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
      replace: true, // Replaces /index.html in browser history
    });
  },
});
