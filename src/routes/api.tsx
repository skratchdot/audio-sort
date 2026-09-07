import { createFileRoute } from "@tanstack/react-router";
import { Api } from "../pages/api";

export const Route = createFileRoute("/api")({ component: Api });
