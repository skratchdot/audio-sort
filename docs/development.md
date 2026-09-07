# Development

Use Node.js 24 or newer with your preferred version manager. Run npm commands
from the repository root; `npm ci` installs dependencies.

## Build and preview

`npm start` serves the site with live updates. `npm run build` creates `dist/`;
`npm run preview` serves that production build.

Eleventy renders the HTML and Vite bundles JavaScript and CSS. Site files live in
`src/`; tests and tool configuration stay at the root. `dist/` and temporary
`src/.11ty-vite/` output are ignored by Git.

Static files live in root-level `public/`: vendor scripts in `public/js/`,
images in `public/img/`, and the `.nojekyll` marker. Files are copied unchanged
to `dist/` without a `public/` URL prefix. Use `/img/...` in source CSS; Vite
adjusts these URLs for the deployment path. Application modules and CSS stay in `src/`.

CSS is bundled and minified by Vite. Bootstrap 2's obsolete star-prefixed IE declarations have
been removed so its styles work with the CSS minifier.

## Checks

`npm run check` runs lint, formatting checks, unit tests, and a production build.

- `npm run lint`: check first-party JavaScript with Oxlint.
- `npm run format`: format with Oxfmt; `npm run format:check` checks without editing.
- `npm test`: run unit tests; `npm run test:watch` reruns them while editing.

Vendor and generated files are excluded from linting and formatting. Source CSS
and HTML are formatted by Oxfmt. Pages use `src/_includes/layout.html` for the
document wrapper so header/footer fragments can be formatted independently.

Run browser tests against a completed production build:

```sh
npx playwright install chromium
npm run build
npm run test:browser
```

Do not rebuild `dist/` while browser tests are running. To use an existing Chrome
installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path.

Browser tests cover root and `/audio-sort/` URLs, workers, editor behavior, and UI
controls. External services are stubbed; audible output and remote soundfonts
need manual testing. Known bugs are tracked in [TODO](todo.md).

## Deployment

GitHub Actions runs checks and browser tests for PRs and before deployment.
CI uses the latest Node.js LTS release. Check/build jobs have a 10-minute timeout;
the deployment job has a 5-minute timeout.
Updates to `main` publish `dist/` to GitHub Pages. The repository's Pages
publishing source must be **GitHub Actions**.

## Reference

- [Architecture](architecture.md)
- [Adding algorithms](adding-algorithms.md)
