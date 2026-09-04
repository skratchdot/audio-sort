# Audio Sort

A webpage to visualize and audibilize sorting algorithms using javascript.

[![Audio Sort][2]][1]

[1]: https://projects.skratchdot.com/audio-sort/index.html
[2]: https://projects.skratchdot.com/audio-sort/img/preview.jpg

## Development

This site is built with [Eleventy](https://www.11ty.dev/) and requires Node.js 24 or newer.
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

Grunt currently builds JS/CSS assets only. For live asset editing, run `npm run watch`
alongside `npm start`; use `npm run test:watch` separately for test feedback.

Pull requests and deployments run the same checks in GitHub Actions. Updates to
`main` deploy to GitHub Pages after those checks pass. In repository Settings →
Pages, the publishing source must be **GitHub Actions**.

### Tests and incremental modernization

Vitest loads first-party source into isolated JavaScript contexts; unit tests do
not depend on `dist`. The suite discovers `js/sort/sort.*.js` algorithms and checks
sorting results, item preservation, frame counters, metadata, and serialized worker
message handling. Worker tests use Node's VM, not a real browser. Deterministic
random input cases make sorting regressions reproducible.

One expected-failure test records an existing metadata bug: Quick advertises
stability but reorders equal-valued items. Correcting that metadata and removing
the exception is a follow-up to this tooling migration.

Oxlint checks first-party JS, tests, and configuration, including the previously
excluded heap sort. Two temporary exceptions in `.oxlintrc.json` preserve legacy
code: `env`/`pluck` are unassigned in `A.Sort.js`, and `getMethod` is unused in
`SortWorker.js`. Remove these exceptions when those files are modernized.

Oxfmt currently formats tests, configuration, workflows, and documentation. Legacy
JS/CSS and Liquid HTML are excluded from formatting to keep changes reviewable;
remove their exclusions as each area is migrated. Vendored libraries and generated
files are excluded from both tools.

The next stages are Vite asset builds and untracking `dist`, an ES-module algorithm
registry and worker API, and incremental UI/jQuery modernization.

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
