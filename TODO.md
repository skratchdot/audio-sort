# Audio Sort

## Todo List

- Add waveform visualization in header while audio is playing

- Add more sorting algorithms

- Improve visualizations / transitions. Allow filtering of what to show / play.

- Add audio controls: string synth vs sin vs saw vs tri, etc

- Add "use defaults" button for audio controls

- Add popovers on sort selection with info about the sort's performance

- Add "export to midi" button(s)

- Add "stats panel" toggle buttons

- Allow data to be set by clicking on the svg node

- Allow defaults to be set via url parameters

- Add "share settings" button which would populate the url based on your current settings

- Clean up the "AS" api. It was rushed. The idea of markers needs to be more generalized.

- Fix the play intervalCallback() function. Shouldn't be looping so much in there. The
  program was running faster before I re-factored a bunch of stuff and added this stupid loop.
