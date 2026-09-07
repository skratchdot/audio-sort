# Audio Sort

## Todo List

- Add waveform visualization in header while audio is playing

- Add more sorting algorithms; see the [catalog](sorting-algorithms.md).

- Improve visualizations / transitions. Allow filtering of what to show / play.

- Add "use defaults" button for audio controls

- Add popovers on sort selection with info about the sort's performance

- Allow defaults to be set via url parameters

- Add "share settings" button which would populate the url based on your current settings

- Fix the play intervalCallback() function. Shouldn't be looping so much in there. The
  program was running faster before I re-factored a bunch of stuff and added this stupid loop.

- Review engine frame-recording quirks.

## Maintenance ideas

See the ordered [modernization plan](modernization.md) for TypeScript, state,
UI, site-build, and remaining vendor-script migrations.
