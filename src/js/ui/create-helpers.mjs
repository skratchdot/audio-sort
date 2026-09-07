import { $ } from "../vendor.mjs";
import { scales } from "../midi/scales.ts";

export function createHelpers(settings, dependencies = { $, scales }) {
  const { $, scales } = dependencies;

  const Helper = {};

  const getMidiNumberHelper = function (degrees, degreeSize, octaveSize, position) {
    return degrees[position % degreeSize] + Math.floor(position / degreeSize) * octaveSize;
  };

  Helper.getMidiNumber = function (playValue) {
    // get some info from our current scale
    const scale = scales[settings.getSelected("scale")];
    const octaveSize = scale.pitchesPerOctave;
    const degrees = scale.degrees;
    const degreeSize = degrees.length;
    const centerValue = Math.floor(settings.getSelected("dataSize") / 2);

    const playMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, playValue);
    const centerMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, centerValue);

    return playMidi + settings.getSelected("centerNote") - centerMidi;
  };

  Helper.createSlider = function (selector, obj, onChange) {
    const $container = $(selector);
    const $elem = $('<div class="audio-sort-slider"></div>');

    $container.empty();
    $elem.appendTo($container);
    const $slider = $elem.slider({
      value: obj.value,
      min: obj.min,
      max: obj.max,
      step: obj.step,
      orientation: "horizontal",
      selection: "none",
      tooltip: "hide",
    });
    $slider.on("slide", onChange);
    $slider.on("slideStop", onChange);
    $(selector + " .slider").width("100%");
    return $slider;
  };

  return Helper;
}
