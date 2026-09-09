import type { ReactNode } from "react";
import { HeadContent, Scripts } from "@tanstack/react-router";
import { Header } from "./header.tsx";
import { Footer } from "./footer.tsx";
import stylesheet from "../../styles/globals.css?url";

export function SiteDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Audio Sort by skratchdot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="audio, sorting algorithms, visualizations" />
        <meta name="author" content="skratchdot.com" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${import.meta.env.BASE_URL}img/favicon.png`}
        />
        <link rel="stylesheet" href={stylesheet} />
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col">
        <div id="wrapper" className="flow-root flex-1">
          <Header />
          {children}
        </div>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
