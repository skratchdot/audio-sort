import type { AudioSettings } from "../audio/audio-settings";
import { scales } from "./scales.ts";

export function createHelpers(
  settings: Pick<AudioSettings, "getSelected">,
  dependencies = { scales },
) {
  return {
    getMidiNumber(playValue: number) {
      const scale = dependencies.scales[settings.getSelected("scale")]!;
      const degrees = scale.degrees;
      const noteAt = (position: number) =>
        degrees[position % degrees.length]! +
        Math.floor(position / degrees.length) * scale.pitchesPerOctave;
      return (
        noteAt(playValue) +
        settings.getSelected("centerNote") -
        noteAt(Math.floor(settings.getSelected("dataSize") / 2))
      );
    },
  };
}
