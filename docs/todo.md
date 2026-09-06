# Audio Sort

## Todo List

- Add waveform visualization in header while audio is playing

- Add more sorting algorithms

- Improve visualizations / transitions. Allow filtering of what to show / play.

- Add "use defaults" button for audio controls

- Add popovers on sort selection with info about the sort's performance

- Allow defaults to be set via url parameters

- Add "share settings" button which would populate the url based on your current settings

- Fix the play intervalCallback() function. Shouldn't be looping so much in there. The
  program was running faster before I re-factored a bunch of stuff and added this stupid loop.

- Correct Quick's stability metadata and remove its expected-failure test.

- Review engine frame-recording quirks and shared bar-pointer state.

## Maintenance ideas

These are options, not a prioritized plan.

- Convert data generators and utilities to modules; remove their global registry
  and VM source loaders.
- Replace jQuery incrementally, starting with chooser/filter events and rendering.
- Assess playback and remote soundfonts before deciding whether to retain, wrap,
  or replace timbre.
