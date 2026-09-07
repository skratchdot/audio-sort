import { createRootRoute } from "@tanstack/react-router";
import { SiteDocument } from "../pages/site-document";

export const Route = createRootRoute({ shellComponent: SiteDocument });
