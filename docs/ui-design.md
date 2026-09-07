# UI direction

**Deferred:** migrate React/Tailwind/TanStack Start with the existing layout first.
This prototype is exploratory reference only; see [the current plan](modernization.md).

Open [the interactive layout study](ui-prototype.html) directly in a browser.
It is self-contained, uses no dependencies, and is not included in the site build.
The layout switch, audio-mode selection, ranges, and disclosures work; charts are
sample data and playback, editing, and export are deliberately disconnected.

## Two directions

|                 | Two-tier workspace (recommended)                                      | Sort-focused workspace                                           |
| --------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Main area       | Input and sorting are always visible, top and bottom.                 | Sorting gets the main area; input becomes a collapsible section. |
| Shared settings | One audio inspector beside both charts.                               | Same inspector; more room for the sorting chart.                 |
| Strength        | Makes the relationship between input, sound, and sort easy to follow. | Better when mostly stepping through or editing algorithms.       |
| Tradeoff        | Less vertical room for each chart.                                    | Comparing input with output requires opening the input section.  |

Start fresh with the presentation, not with the engine. The recommended direction
keeps the top/bottom relationship from the existing app without the narrow column
of counters or the settings panel determining both chart sizes.

## Existing features to preserve

- Input generators, data size, and direct dragging of input values.
- Separate input/sort transports: first/last, forward/reverse, stop, loop, scrubber.
- Algorithm selection, metadata, editable source, custom algorithms, and AutoPlay.
- Bar/flat renderers and comparison/swap/position counters.
- Shared volume, tempo, center note, scale, and waveform/soundfont selection.
- Eight waveform types with one shared envelope; native sample instruments/filter.
- MIDI export for either player, including filename, channel, and instrument.
- About/API pages, keyboard access, static hosting, and existing URL/base-path support.

The prototype shows representative algorithms, scales, and instruments rather
than duplicating registries. It is a layout review, not a replacement application.
No new features are committed by this design step. In particular, multi-algorithm
comparison, saved presets, URL sharing, and new recording operations stay separate.

## Interaction and responsive rules

- Keep frequently used playback controls beside the visualization they control.
- Put counters on one horizontal strip, not between the catalog and chart.
- Use one shared audio inspector; expanding envelope settings must not push the
  sorting workspace down on desktop. The inspector can scroll independently there.
- Start with one breakpoint at 900px: inspector beside charts above it, normal
  document flow below it. No fixed-height clipping or nested inspector scrolling
  on mobile. Mobile settings can collapse; charts remain above them.
- Use full labels, visible focus, native controls where useful, and reduced motion.
- Dialogs handle editing, metadata, and export without hiding their entry points.

## Implementation after layout approval

Deliver the functional workspace as one cohesive React migration: the page shell,
both charts/transports, algorithm controls, and shared audio inspector. Do not
mount React inside DOM still owned by the legacy controller.

1. Add React/TypeScript and Tailwind; create an application hook that coordinates
   the existing vanilla Jotai store, recorder/worker requests, transport, and audio.
   Effects must dispose subscriptions, players, and pending work on unmount.
2. Give each D3 renderer exclusive ownership of its SVG subtree. React owns the
   surrounding controls, labels, and layout, not the generated bars or markers.
3. Move edit/add and MIDI dialogs to selected accessible shadcn components; retain
   lazy Ace loading and JavaScript algorithm source. Static registries remain imports.
4. Remove the legacy controller, Bootstrap/slider, and jQuery after their final
   consumers migrate, including About/API shell styling. Preserve behavior rather
   than compatibility shims for the old selectors.
5. Run feature-parity/browser checks at root and Pages paths, including keyboard
   dialogs, dragging, native sample playback, and repeated mount/unmount.

Keep Eleventy for this step. TanStack Start/static deployment remains phase 7;
do not combine the audio engine, UI, and site-builder migrations in one rewrite.

## Review needed

Choose the two-tier or sort-focused direction, identify any must-have new features,
and decide whether the audio inspector should be visible by default on mobile.
The light palette and spacing are a starting point, not a final visual identity.
