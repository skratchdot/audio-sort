import { createFileRoute } from "@tanstack/react-router";
import { About } from "../pages/about";

export const Route = createFileRoute("/about")({ component: About });
