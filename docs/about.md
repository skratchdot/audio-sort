# About Audio Sort

I created Audio Sort to "hear" what sorting algorithms sound like. You can watch
and listen to each algorithm at work, then edit its code to see how small changes
affect the result.

## Why it started in 2013

The project was also an excuse to experiment with relatively new web technologies:
[Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), responsive design with [Bootstrap 2](https://getbootstrap.com/2.3.2/), [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API), and [D3](https://d3js.org/).
Sorting gave me a way to bring them together in one browser experiment.

[Timbre.js](https://mohayonao.github.io/timbre.js/) handled the sound, D3 drew the visualizations, and Bootstrap made the
interface adapt to different screen sizes. Web Workers ran the sorting algorithms
without blocking the interface. Along with editable algorithms and MIDI export,
those pieces made Audio Sort a playground for learning about both sorting and
the web.

The [original project page](https://skratchdot.com/projects/audio-sort/) lists
the libraries and links to other sorting experiments.

## What changed in 2026

A bug report about **Edit Algorithm** brought me back to the project. The fix was
small: the editor assumed a particular format for `Function.toString()` output.
The breakage appears to date back to the 2019 ECMAScript changes to that output,
with a line break before the function arguments tripping up the old code.

Once that worked again, I decided to use the project to gain more experience
modernizing a legacy codebase with AI. That meant untangling the [jQuery](https://jquery.com/) soup,
separating settings and playback from the interface, and updating the libraries
and build tools.

[React](https://react.dev/) now renders the interface and charts, with [Tailwind CSS](https://tailwindcss.com/) and [shadcn](https://ui.shadcn.com/) components
replacing the old Bootstrap controls. [Jotai](https://jotai.org/) manages settings, [TypeScript](https://www.typescriptlang.org/) helps
check the code, and [Vite](https://vite.dev/) and [TanStack Start](https://tanstack.com/start/latest) build the site for static hosting.
D3 still supplies chart utilities, and Timbre still handles synthesis, with native
browser audio decoding replacing the old sample-loading scripts.

The tools have changed, but the idea is the same: a place to experiment, learn,
and make a little music out of sorting.

## Try it or get involved

[Start Sorting](/) or read the [Algorithm API](api.md) to write your own algorithm.
If you find a bug or have a feature request, [open an issue](https://github.com/skratchdot/audio-sort/issues).
