import { TextLink } from "@/components/text-link";
import { useEffect, useState } from "react";

export function Footer() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    // Read the visitor's current year, not the year the static HTML was built.
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer id="footer" className="shrink-0 border-t border-neutral-300 bg-neutral-100">
      <div className="mx-auto flex min-h-16 w-[calc(100%-2rem)] max-w-7xl flex-wrap items-center justify-center gap-3 py-3 text-sm lg:justify-between">
        <div className="footer-built-with hidden lg:block">
          built with:{" "}
          <TextLink target="_blank" href="https://mohayonao.github.io/timbre.js/">
            timbre.js
          </TextLink>
          ,{" "}
          <TextLink target="_blank" href="https://d3js.org/">
            D3
          </TextLink>
          ,{" "}
          <TextLink target="_blank" href="https://react.dev/">
            React
          </TextLink>
          ,{" "}
          <TextLink target="_blank" href="https://tailwindcss.com/">
            Tailwind CSS
          </TextLink>
          , and{" "}
          <TextLink target="_blank" href="https://github.com/skratchdot/audio-sort/#built-with">
            others
          </TextLink>
        </div>

        <div className="footer-copy">
          &copy; 2013{year === null ? "" : ` - ${year}`}{" "}
          <TextLink className="footer-icon" href="http://skratchdot.com/">
            skratchdot{" "}
            <img
              className="inline size-4"
              alt="skratchdot"
              src={`${import.meta.env.BASE_URL}img/favicon.ico`}
            />
          </TextLink>
        </div>
      </div>
    </footer>
  );
}
