import { createFileRoute } from "@tanstack/react-router";
import { DocsPage } from "@/components/docs-page";
import content from "../../docs/api.md?raw";

// Match the marker fills in player-chart.tsx; keep color names readable in Markdown.
const markerColors: Record<string, string> = {
  White: "bg-neutral-50",
  Amber: "bg-amber-400",
  Yellow: "bg-yellow-300",
  Green: "bg-green-500",
  Purple: "bg-purple-600",
};

function Page() {
  return (
    <DocsPage
      content={content}
      id="api"
      tableLabel="Algorithm API reference"
      components={{
        td: ({ children }) => {
          const color = typeof children === "string" ? markerColors[children] : undefined;
          return (
            <td>
              {children}
              {color && (
                <span
                  aria-hidden="true"
                  className={`mt-2 block size-10 border-2 border-neutral-700 ${color}`}
                />
              )}
            </td>
          );
        },
      }}
    />
  );
}

export const Route = createFileRoute("/api")({ component: Page });
