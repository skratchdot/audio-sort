import { createFileRoute } from "@tanstack/react-router";
import { DocsPage } from "@/components/docs-page";
import content from "../../docs/about.md?raw";

function Page() {
  return <DocsPage content={content} id="about" tableLabel="About reference" />;
}

export const Route = createFileRoute("/about")({ component: Page });
