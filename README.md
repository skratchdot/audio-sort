# Audio Sort

Watch and listen to sorting algorithms in your browser, or edit them to experiment with their behavior.

[![Audio Sort][2]][1]

[1]: https://projects.skratchdot.com/audio-sort/
[2]: https://projects.skratchdot.com/audio-sort/img/preview.jpg

## Project links

- [Live Demo](https://projects.skratchdot.com/audio-sort/): Try Audio Sort in your browser.
- [About](docs/about.md): The project’s origins and 2026 modernization.
- [Algorithm API](docs/api.md): Write custom algorithms using the recording API.
- [Sorting algorithm catalog](docs/sorting-algorithms.md): Compare algorithms, implementation status, and candidates for additions.
- [Original project page](https://skratchdot.com/projects/audio-sort/): The historical project overview and collection of related resources.
- [Source Code](https://github.com/skratchdot/audio-sort/): Browse the code, issues, and development history on GitHub.
- [TODO List](docs/todo.md): See open feature ideas and maintenance work.

## Development

Requires Node.js 24+ and pnpm (version pinned in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `/audio-sort/` on the development server. Build with `pnpm run build`
(output: `dist/audio-sort/`). Run checks with `pnpm run check`.

See [development documentation](docs/development.md) for browser tests and deployment.

## Built With

- [timbre.js](https://mohayonao.github.io/timbre.js/): Synthesizes tones and plays soundfont instruments for sorting playback.
- [D3](https://d3js.org/): Provides scale, color, path geometry, and array utilities; React renders the SVG charts.
- [Jotai](https://jotai.org/): Stores selected audio and sorting settings independently of the UI.
- [React](https://react.dev/): Renders settings, playback controls, and editing/export dialogs.
- [TanStack Start](https://tanstack.com/start): Prerenders the React pages for static hosting.
- [Tailwind CSS](https://tailwindcss.com/): Styles the workspace and its reusable components.
- [shadcn/ui](https://ui.shadcn.com/): Provides buttons, dialogs, tabs, and sliders built on Base UI.
- [Lucide](https://lucide.dev/): Provides consistent SVG icons for playback and other controls.
- [Ace](https://ace.c9.io/): Powers the algorithm editor with syntax highlighting and JavaScript diagnostics.
- [jsmidgen](https://github.com/dingram/jsmidgen): Encodes sorting playback as MIDI files.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js): Downloads generated MIDI files in the browser.

### Additional Credits

- Musical scale data is adapted from [subcollider.js](https://github.com/mohayonao/subcollider).
  All 108 scales and the original license notice are preserved in [scales.ts](src/midi/scales.ts).

## Related resources

### Articles and references

- [Wikipedia: Sorting Algorithms](https://en.wikipedia.org/wiki/Sorting_algorithm): An overview of sorting methods, complexity, and stability.
- [c2.com: Sorting Algorithms](https://wiki.c2.com/?SortingAlgorithms): Community wiki discussions of sorting techniques.
- [Visualising Sorting Algorithms by Aldo Cortesi](https://corte.si/posts/code/visualisingsorting/): An explanation of static sorting diagrams and how to read them.
- [Visualizing Algorithms by Mike Bostock](https://bost.ocks.org/mike/algorithms/): An illustrated essay on explaining algorithms through visualization.
- [Sorting Algorithms Visualised by Callum Macrae](https://macr.ae/article/sorting-algorithms): A blog post exploring sorting through visualization.
- [DuckDuckGo: Sorting Algorithms](https://duckduckgo.com/?q=sorting+algorithms): Search for more sorting resources.

### Interactive visualizations

- [Sorting Algorithms Animations](https://www.toptal.com/developers/sorting-algorithms): Compare sorting methods across different input arrangements.
- [Visual Sorts on Canvas by Joshua Kehn](https://www.joshuakehn.com/blog/static/sort.html): Compare JavaScript sorting algorithms with canvas animations and adjustable input data.
- [Data Structure Visualizations](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html): Interactive teaching demos covering sorting, trees, graphs, and other data structures.
- [VisuAlgo](https://visualgo.net/en): Animated explanations of data structures and algorithms.
- [Algorithm Visualizer](https://github.com/algorithm-visualizer/algorithm-visualizer): An interactive platform for visualizing algorithms from code.
- [Algorithm Playground](https://github.com/awalGarg/alpg): Visualize custom algorithms and step backward and forward through their execution.
- [Python Algorithm Visualizations](https://pyalgoviz.appspot.com/): A tool for visualizing algorithms written in Python.
- [Sorting Visualizer - Karim Elghamry](https://github.com/KarimElghamry/sorting-visualizer): A sorting visualizer built with React.
- [SortDemon](https://github.com/copperhuh/SortDemon): Visualizations of over 30 sorting algorithms with adjustable speed and input size.

### Sorting with sound

- [Assortment - webcloud.se](https://webcloud.se/Assortment/): A browser experiment combining sorting and sound.
- [Sound Of Sorting: Downloadable App](https://panthema.net/2013/sound-of-sorting/): A desktop application that visualizes sorting and turns comparisons into sound.

### Videos and animation galleries

- [YouTube: Visualization of Quick Sort](https://www.youtube.com/watch?v=aXXWXz5rF64): A video demonstration of quicksort.
- [YouTube: 15 Sorting Algorithms in 6 Minutes](https://www.youtube.com/watch?v=kPRA0W1kECg): A video comparing the sights and sounds of 15 sorting algorithms.
- [YouTube: What different sorting algorithms sound like](https://www.youtube.com/watch?v=t8g-iYGHpEA): A video comparison of sorting algorithms through sound.
- [YouTube: Heapsort audibilization](https://www.youtube.com/watch?v=iXAjiDQbPSw): A sound-based demonstration of heapsort.
- [YouTube: The Sound of Quicksort](https://www.youtube.com/watch?v=m1PS8IR6Td0): A sound-based demonstration of quicksort.
- [YouTube: SORTDEMO.BAS](https://www.youtube.com/watch?v=leNaS9eJWqo): A video of the BASIC sorting demonstration.
- [Sorting Visualizations on imgur by FishyMcFishFace](https://imgur.com/gallery/RM3wl): A gallery of sorting animations.

#### Sorting Out Sorting

- [Sorting Out Sorting - Part 1](https://www.youtube.com/watch?v=YvTW7341kpA): The opening segment of the sorting film.
- [Sorting Out Sorting - Part 2](https://www.youtube.com/watch?v=plAi7kcqMNU): The second segment of the sorting film.
- [Sorting Out Sorting - Part 3](https://www.youtube.com/watch?v=gtdfW3TbeYY): The third segment of the sorting film.
- [Sorting Out Sorting - Part 4](https://www.youtube.com/watch?v=wdcoRfS8edM): The final segment in this four-part upload.

### Source code collections

- [Sound Of Sorting](https://github.com/bingmann/sound-of-sorting): Source code for the desktop visualization and audio application.
- [sortvis](https://github.com/cortesi/sortvis): Python/Cairo code for generating static sorting diagrams.
- [VisualSort](https://github.com/thedufer/VisualSort): Source for a browser visualizer that records and displays custom sorting algorithms.
- [Illustrated Algorithms](https://github.com/ovidiuch/illustrated-algorithms): Archived source and examples of visualizations with reversible execution.
- [Wikibooks: Sorting implementations](https://en.wikibooks.org/wiki/Algorithm_Implementation/Sorting): Sorting implementations organized by algorithm and programming language.
- [Rosetta Code: Sorting algorithms](https://rosettacode.org/wiki/Category:Sorting_Algorithms): Sorting tasks and implementations in multiple languages.
- [escherba/algorithms-in-javascript](https://github.com/escherba/algorithms-in-javascript/): A collection of algorithm implementations in JavaScript.
- [humanwhocodes/computer-science-in-javascript](https://github.com/humanwhocodes/computer-science-in-javascript): JavaScript implementations of classic algorithms and data structures.

### Beyond sorting

- [Machine Learning visualizer](https://jeff3dx.github.io/mlearning/): Interactive classification and clustering demos, including nearest neighbors and k-means.
- [Morpheus - Visual Algorithm Simulator](https://rkarthick.github.io/morpheus-client/): Simulates synchronous distributed algorithms, including leader election in a ring.

## License

Copyright (c) 2013 skratchdot  
Licensed under the MIT license.
