import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppLink, TextLink } from "@/components/text-link";

/** Explicit publication list: other development docs are not site pages. */
const documentRoutes: Record<string, string> = {
  "about.md": "/about",
  "api.md": "/api",
};

export function DocsPage({
  content,
  id,
  tableLabel = "Documentation table",
  components,
}: {
  content: string;
  id?: string;
  tableLabel?: string;
  components?: Components;
}) {
  return (
    <article
      id={id}
      className="mx-auto my-8 w-[calc(100%-2rem)] max-w-7xl text-base leading-relaxed [&_h1]:mb-6 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:mt-8 [&_li]:my-2 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href = "", children }) => {
            const [path] = href.split(/[?#]/);
            const route = documentRoutes[(path ?? "").replace(/^\.\//, "")];
            const destination = route ? route + href.slice(path!.length) : href;
            if (route || (destination.startsWith("/") && !destination.startsWith("//"))) {
              return <AppLink to={destination}>{children}</AppLink>;
            }
            return <TextLink href={destination}>{children}</TextLink>;
          },
          table: ({ children }) => (
            <div
              className="max-w-full overflow-x-auto"
              role="region"
              aria-label={tableLabel}
              tabIndex={0}
            >
              <table>{children}</table>
            </div>
          ),
          ...components,
        }}
      >
        {content}
      </Markdown>
    </article>
  );
}
