import { createRootRoute } from "@tanstack/react-router";
import { SiteDocument } from "../components/layout/site-document";

export const Route = createRootRoute({ shellComponent: SiteDocument });
