# TODO

Open ideas and maintenance work, not an ordered roadmap. Completed migration
history lives in Git; [About](about.md) summarizes the project story.

## Algorithms and recording

- Add more algorithms; see the [catalog](sorting-algorithms.md).
- Design recorded writes and auxiliary buffers for Merge, Counting, and Radix,
  preserving item identity and showing intermediate work.
- Review frame-recording behavior, including the extra terminal frame and how
  marker calls are grouped into playback steps.

## Maintenance

- Complete the audio migration listening review using the
  [audio checklist](architecture.md#audio). Automated tests are not a listening review.
- Review third-party attribution across dependencies, adapted code/data, and audio assets.
- Extend TypeScript coverage to remaining JavaScript runtime modules where useful.

## Interface ideas

- Add a waveform visualization in the header during playback.
- Improve transitions and allow filtering which operations are shown or played.
- Add a reset-to-defaults action for audio controls.
- Make algorithm performance information easier to discover. It is already
  available in the selected algorithm's Information tab; inline hints are optional.
- Support URL-based settings and a share-settings action.
