import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./route-tree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    trailingSlash: "preserve",
    scrollRestoration: true,
  });
}
