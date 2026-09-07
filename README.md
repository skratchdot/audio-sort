# Audio Sort

A webpage to visualize and audibilize sorting algorithms using javascript.

[![Audio Sort][2]][1]

[1]: https://projects.skratchdot.com/audio-sort/index.html
[2]: https://projects.skratchdot.com/audio-sort/img/preview.jpg

## Development

Requires Node.js 24+ and pnpm (version pinned in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm start
```

Build with `pnpm run build` (output: `dist/`). Run checks with `pnpm run check`.

See [development documentation](docs/development.md) for browser tests and deployment.

## Audio Sort Links

- [Live Demo](https://projects.skratchdot.com/audio-sort/index.html)

- [Project Page / Comments](https://skratchdot.com/projects/audio-sort/)

- [Source Code](https://github.com/skratchdot/audio-sort/)

- [TODO List](docs/todo.md)

## Built With

- [timbre.js](https://mohayonao.github.io/timbre.js/) — Synthesizes tones and plays soundfont instruments for sorting playback.
- [D3](https://d3js.org/) — Draws SVG bars, markers, and paths using modular selection, scale, color, shape, and array utilities.
- [jQuery](https://jquery.com/) — Handles DOM updates, UI events, and legacy plugins.
- [Bootstrap 2](https://getbootstrap.com/2.3.2/) — Provides the responsive layout, styling, tabs, dropdowns, and modals.
- [bootstrap-slider](https://www.eyecon.ro/bootstrap-slider/) — Stefan Petre's slider controls for audio settings, dataset size, and playback position.
- [Ace](https://ace.c9.io/) — Powers the algorithm editor with syntax highlighting and JavaScript diagnostics.
- [jsmidgen](https://github.com/dingram/jsmidgen) — Encodes sorting playback as MIDI files.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) — Downloads generated MIDI files in the browser.

## See Also / Credits

Musical scale data is adapted from [subcollider.js](https://github.com/mohayonao/subcollider).
All 108 scales and the original license notice are preserved in [scales.ts](src/js/midi/scales.ts).

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
