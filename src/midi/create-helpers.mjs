import { scales } from "./scales.ts";

export function createHelpers(settings, dependencies = { scales }) {
  return {
    getMidiNumber(playValue) {
      const scale = dependencies.scales[settings.getSelected("scale")];
      const degrees = scale.degrees;
      const noteAt = (position) =>
        degrees[position % degrees.length] +
        Math.floor(position / degrees.length) * scale.pitchesPerOctave;
      return (
        noteAt(playValue) +
        settings.getSelected("centerNote") -
        noteAt(Math.floor(settings.getSelected("dataSize") / 2))
      );
    },
  };
}
