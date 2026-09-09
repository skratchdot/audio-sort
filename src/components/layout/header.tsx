import { AppLink, TextLink } from "@/components/text-link";

export function Header() {
  return (
    <header id="header" className="border-b border-neutral-300 bg-neutral-100">
      <div className="mx-auto flex w-[calc(100%-2rem)] max-w-7xl flex-col items-center justify-between gap-3 py-3 lg:flex-row">
        <h1
          id="header-title"
          className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1"
        >
          <AppLink
            to="/"
            className="home-link font-display text-3xl font-bold uppercase text-neutral-700 hover:text-neutral-700 lg:text-4xl"
          >
            Audio Sort
          </AppLink>
          <TextLink
            id="header-author"
            href="https://skratchdot.com/"
            className="text-base font-normal text-red-700 hover:text-red-800 lg:text-xl"
          >
            <span>by skratchdot</span>
            <sub>✪</sub>
          </TextLink>
        </h1>
        <nav id="header-nav" aria-label="Main navigation">
          <ul className="flex items-center gap-3 text-sm">
            <li>
              <AppLink to="/">Home</AppLink>
              <span className="ml-3 text-neutral-400" aria-hidden="true">
                /
              </span>
            </li>
            <li>
              <AppLink to="/about">About</AppLink>
              <span className="ml-3 text-neutral-400" aria-hidden="true">
                /
              </span>
            </li>
            <li>
              <AppLink to="/api">API</AppLink>
            </li>
            <li>
              <TextLink
                href="https://github.com/skratchdot/audio-sort/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Source on GitHub"
                title="Source on GitHub"
                className="flex items-center text-black hover:text-black"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="size-5" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                </svg>
              </TextLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
