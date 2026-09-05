# Audio Sort

A webpage to visualize and audibilize sorting algorithms using javascript.

[![Audio Sort][2]][1]

[1]: https://projects.skratchdot.com/audio-sort/index.html
[2]: https://projects.skratchdot.com/audio-sort/img/preview.jpg

## Development

This site is built with [Eleventy](https://www.11ty.dev/) and [Vite](https://vite.dev/)
and requires Node.js 24 or newer.
Use `nvm use` to select the Node 24 version also used in CI.

```sh
npm ci
npm start
```

The production build is written to `_site`:

```sh
npm run build
```

Run all checks before submitting changes:

```sh
npm run check
```

This runs Oxlint, Oxfmt's formatting check, Vitest, and the production build.
Individual commands are `npm run lint`, `npm run format`, `npm run format:check`,
`npm test`, and `npm run test:watch`.

`npm start` serves the site with live JS/CSS and template updates; a separate asset
watcher is no longer needed. `npm run watch` is an alias. Use `npm run preview` to
serve the production build and `npm run test:watch` for unit-test feedback.

Run browser checks against a fresh production build:

```sh
npx playwright install chromium
npm run build
npm run test:browser
```

Playwright checks the pages at both `/` and `/audio-sort/`, including actual
bundled workers executing every built-in algorithm and custom algorithm code.
External analytics, sharing widgets, and soundfonts are stubbed in these tests;
they do not verify audible output. To use an existing Chrome installation, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path.

Pull requests and deployments run these checks plus the browser suite in GitHub Actions. Updates to
`main` deploy to GitHub Pages after those checks pass. In repository Settings →
Pages, the publishing source must be **GitHub Actions**.

### Tests and incremental modernization

Vitest imports algorithm modules directly and creates isolated JavaScript contexts
for the remaining legacy engine/generators. Tests do not depend on generated output.
The suite discovers `js/sort/sort.*.mjs` files, checks registry/source coverage,
sorting results, item preservation, frame counters, metadata, and the worker request
handler. It also verifies built-ins never compile source and readable editor code
still executes after saving. Deterministic random cases keep regressions reproducible.
Playwright additionally exercises real bundled workers, editor saves, new custom
algorithms, and the no-Worker fallback in the production site.

One expected-failure test records an existing metadata bug: Quick advertises
stability but reorders equal-valued items. Correcting that metadata and removing
the exception is a follow-up to this tooling migration.

Oxlint checks first-party JS, tests, and configuration, including the previously
excluded heap sort. One temporary exception in `.oxlintrc.json` preserves the
unassigned legacy `env`/`pluck` variables in `A.Sort.js`. The old worker and its
unused-function exception have been removed.

Oxfmt formats first-party JS, tests, configuration, workflows, and documentation.
Legacy CSS and Liquid HTML remain excluded. Vendored libraries and generated
files are excluded from both tools.

### Asset builds and next steps

Eleventy renders HTML; Vite bundles the `js/main.mjs`, `js/worker.mjs`, and
`css/main.css` entries. Generated assets have content-hashed filenames and relative
URLs for GitHub Pages. `_site`, `.11ty-vite`, and the obsolete `dist` directory are
ignored: generated output is built in CI, not checked in.

For now, `js/lib` and images are copied unchanged. CSS is bundled but not minified
because Bootstrap 2 includes obsolete IE syntax rejected by the modern minifier.
JavaScript and the worker are minified. First-party IIFEs use `globalThis` as a
temporary bridge from ES-module entries to the existing global APIs.

### Algorithms and worker protocol

Built-in algorithms are ES modules with a default function taking the `AS` engine
as its argument. `js/sort/registry.mjs` is the shared, immutable registry; the UI
receives its own mutable catalog for edits and additions, without `globalThis.sort`.

Untouched built-ins send `{ key, type: "builtin", id, arr }` to the worker and run
the imported function directly—no serialization or dynamic compilation. Edited
and new custom algorithms send `{ key, type: "custom", source, arr }`, where `source`
is the editor's function body. Only custom code uses `Function("AS", source)`.
Replies contain `{ key, frames }` or `{ key, error }`. The no-Worker fallback uses
the same request handler. Custom code is arbitrary JavaScript, not a security sandbox.

`js/sort/sources.mjs` imports original source as text for the editor, separately from
the executable registry. This avoids showing minified variable names and excludes
readable source strings from the worker bundle. Saving a built-in creates a custom
override and preserves its display metadata; it never modifies the shared registry.

To add an algorithm:

1. Add `js/sort/sort.<id>.mjs`, following an existing default-function and metadata
   convention. Use the passed `AS` API for frame/operation recording.
2. Import/register it under a stable ID in `registry.mjs` and add its raw source to
   `sources.mjs`. Tests detect missing registrations. Runtime discovery is now explicit.
3. Keep the editable function body self-contained, using `AS` and standard JavaScript;
   imported helpers are supported by module execution but aren't available when the
   body is copied into the custom editor.
4. Run `npm run check` and `npm run test:browser`. The test suites discover the new
   module and exercise correctness, metadata, worker execution, and editor round trips.

Next: modernize the remaining engine/UI modules and replace jQuery incrementally.
New sorting algorithms can be added independently with these tests guarding each
addition. The known Quick stability metadata bug remains a separate small fix.

## Audio Sort Links

- [Live Demo](https://projects.skratchdot.com/audio-sort/index.html)

- [Project Page / Comments](https://skratchdot.com/projects/audio-sort/)

- [Source Code](https://github.com/skratchdot/audio-sort/)

- [TODO List](https://github.com/skratchdot/audio-sort/blob/main/TODO.md)

## Built With

- [timbre.js](http://mohayonao.github.io/timbre.js/)

- [subcollider.js](http://mohayonao.github.io/subcollider.js/)

- [d3](http://d3js.org/)

- [jquery](http://jquery.com/)

- [bootstrap](http://twitter.github.com/bootstrap/)

- [bootstrap-slider](http://www.eyecon.ro/bootstrap-slider/)

- [JS Beautifier](http://jsbeautifier.org/)

- [JsMidGen](https://github.com/dingram/jsmidgen)

- [Blob.js](https://github.com/eligrey/Blob.js)

- [FileSaver.js](https://github.com/eligrey/FileSaver.js)

## See Also / Credits

### About Sorting Algorithms

- [Wikipedia: Sorting Algorithms](http://en.wikipedia.org/wiki/Sorting_algorithms)

- [DuckDuckGo: Sorting Algorithms](https://duckduckgo.com/c/Sorting_algorithms)

- [c2.com: Sorting Algorithms](http://c2.com/cgi/wiki?SortingAlgorithms)

### Visual

- [sorting-algorithms.com](http://www.sorting-algorithms.com/)

- [sortvis.org](http://sortvis.org/index.html)

- [corte.si](http://corte.si/posts/code/visualisingsorting/index.html)

- [visualsort.appspot.com](http://visualsort.appspot.com/)

- [joshuakehn.com](http://joshuakehn.com/blog/static/sort.html)

- [Youtube: Visualization Of QuickSort](http://www.youtube.com/watch?v=aXXWXz5rF64)

- [Visualizing Algorithms by Mike Bostock](https://bost.ocks.org/mike/algorithms/)

- [Algorithm Visualizer](https://github.com/parkjs814/AlgorithmVisualizer)

- [Algorithm Playground](https://github.com/awalGarg/alpg)

- [Data Structure Visualizations](http://www.cs.usfca.edu/~galles/visualization/Algorithms.html)

- [VisuAlgo](http://visualgo.net/)

- [Illustrated-Algorithms](https://illustrated-algorithms.now.sh/)

- [Sorting Algorithms Visualised - Blog Post on http://macr.ae/](http://macr.ae/article/sorting-algorithms.html)

- [Sorting Visualizations on imgur by FishyMcFishFace](https://imgur.com/gallery/RM3wl)

- [Sorting Algorithms Animations](https://www.toptal.com/developers/sorting-algorithms/)

- [Machine Learning visualizer](https://jeff3dx.github.io/mlearning)

- [Python Algorithm Visualizations](https://pyalgoviz.appspot.com/)

- [Morpheus - Visual Algorithm Simulator](https://rkarthick.github.io/morpheus-client/)

- [Sorting Visualizer - Karim Elghamry](https://github.com/KarimElghamry/sorting-visualizer)

- [SortDemon](https://github.com/copperhuh/SortDemon)

- [Algorithm Visualizer](https://github.com/algorithm-visualizer/algorithm-visualizer)

### Other Audio Web Apps

- [Assortment - webcloud.se](http://webcloud.se/Assortment/)

- [Sounds Of Sorting - caseyrule.com](http://www.caseyrule.com/projects/sounds-of-sorting/)

### Audio

- [Sound Of Sorting: Downloadable App](http://panthema.net/2013/sound-of-sorting/)

- [Youtube: 15 Sorting Algorithms in 6 Minutes](https://www.youtube.com/watch?v=kPRA0W1kECg)

- [Youtube: 15 Sorting Algorithms charted for Guitar Hero/Clone Hero](https://www.youtube.com/watch?v=YyerMJlmtts)

- [Youtube: What different sorting algorithms sound like](http://www.youtube.com/watch?v=t8g-iYGHpEA)

- [Youtube: Heapsort audibilization](http://www.youtube.com/watch?v=iXAjiDQbPSw)

- [Youtube: The Sound of Quicksort](http://www.youtube.com/watch?v=m1PS8IR6Td0)

- [Youtube: SORTDEMO.BAS](https://www.youtube.com/watch?v=leNaS9eJWqo)

### Sorting Out Sorting

- [Sorting Out Sorting - Part 1](http://www.youtube.com/watch?v=YvTW7341kpA)

- [Sorting Out Sorting - Part 2](http://www.youtube.com/watch?v=plAi7kcqMNU)

- [Sorting Out Sorting - Part 3](http://www.youtube.com/watch?v=gtdfW3TbeYY)

- [Sorting Out Sorting - Part 4](http://www.youtube.com/watch?v=wdcoRfS8edM)

### Implementations

- [Sound Of Sorting](https://github.com/bingmann/sound-of-sorting)

- [wikibooks.org](http://en.wikibooks.org/wiki/Algorithm_Implementation/Sorting)

- [rosettacode.org](http://rosettacode.org/wiki/Category:Sorting_Algorithms)

- [Github User: escherba](https://github.com/escherba/algorithms-in-javascript/)

- [Github User: nzakas](https://github.com/nzakas/computer-science-in-javascript/)

## License

Copyright (c) 2013 skratchdot  
Licensed under the MIT license.
