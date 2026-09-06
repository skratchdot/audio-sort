# Development

Use Node.js 24 or newer with your preferred version manager. Run npm commands
from the repository root; `npm ci` installs dependencies.

## Build and preview

`npm start` serves the site with live updates. `npm run build` creates `_site/`;
`npm run preview` serves that production build.

Eleventy renders the HTML and Vite bundles JavaScript and CSS. Site files live in
`src/`; tests and tool configuration stay at the root. `_site/` and temporary
`src/.11ty-vite/` output are ignored by Git.

Vendor scripts in `src/js/lib/` and images are copied unchanged. CSS is bundled
but not minified because Bootstrap 2's legacy IE syntax is incompatible with the
minifier.

## Checks

`npm run check` runs lint, formatting checks, unit tests, and a production build.

- `npm run lint`: check first-party JavaScript with Oxlint.
- `npm run format`: format with Oxfmt; `npm run format:check` checks without editing.
- `npm test`: run unit tests; `npm run test:watch` reruns them while editing.

Vendor and generated files are excluded from linting and formatting. Legacy CSS
and Liquid HTML are also excluded from formatting.

Run browser tests against a completed production build:

```sh
npx playwright install chromium
npm run build
npm run test:browser
```

Do not rebuild `_site/` while browser tests are running. To use an existing Chrome
installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path.

Browser tests cover root and `/audio-sort/` URLs, workers, editor behavior, and UI
controls. External services are stubbed; audible output and remote soundfonts
need manual testing. Known bugs are tracked in [TODO](todo.md).

## Deployment

GitHub Actions runs checks and browser tests for PRs and before deployment.
CI uses the latest Node.js LTS release. Check/build jobs have a 10-minute timeout;
the deployment job has a 5-minute timeout.
Updates to `main` publish `_site/` to GitHub Pages. The repository's Pages
publishing source must be **GitHub Actions**.

## Reference

- [Architecture](architecture.md)
- [Adding algorithms](adding-algorithms.md)
