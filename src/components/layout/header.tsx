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
          <ul className="flex gap-3 text-sm">
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
              <span className="ml-3 text-neutral-400" aria-hidden="true">
                /
              </span>
            </li>
            <li>
              <TextLink href="https://github.com/skratchdot/audio-sort/" target="_blank">
                Source
              </TextLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
