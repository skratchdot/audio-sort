import { $ } from "../vendor.mjs";
import { scales } from "../midi/scales.ts";

export function createHelpers(settings, dependencies = { $, scales }) {
  const { $, scales } = dependencies;

  const Helper = {};
  const sliderDisposers = new Map();

  Helper.destroySlider = function ($slider) {
    $slider?.each(function () {
      sliderDisposers.get(this)?.();
    });
  };
  Helper.destroySliders = function () {
    for (const dispose of sliderDisposers.values()) dispose();
  };

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

    Helper.destroySlider($container.find(".audio-sort-slider"));
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
    const instance = $slider.data("slider");
    // The legacy plugin has no destroy API. Give each instance unique drag
    // callbacks so removing one cannot unbind another slider's document handlers.
    instance.mousemove = instance.mousemove.bind(instance);
    instance.mouseup = instance.mouseup.bind(instance);
    sliderDisposers.set($elem[0], () => {
      $(document).off("mousemove touchmove", instance.mousemove);
      $(document).off("mouseup touchend", instance.mouseup);
      instance.inDrag = false;
      instance.picker.remove();
      $elem.remove();
      sliderDisposers.delete($elem[0]);
    });
    $slider.on("slide", onChange);
    $slider.on("slideStop", onChange);
    $(selector + " .slider").width("100%");
    return $slider;
  };

  return Helper;
}
