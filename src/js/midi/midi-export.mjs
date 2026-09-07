import { $ } from "../vendor.mjs";
import { instruments } from "./instruments.mjs";
/*!
 * Project: Audio Sort
 *    File: midi-export.mjs
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */

export const MidiExport = {};

MidiExport.populateChannels = function (selector) {
  const $select = $(selector);

  let html = "";
  const numChannels = 16;

  // empty select
  $select.empty();

  // populate select
  for (let i = 0; i < numChannels; i++) {
    const $option = $("<option></option>").val(i).text(i);
    if (i === 0) {
      $option.attr("selected", "selected");
    }
    html += $option.wrap("<div />").parent().html();
  }
  $select.append(html);
};

MidiExport.populateInstruments = function (selector) {
  let group = "";
  const $select = $(selector);
  let $optGroup;

  // empty select
  $select.empty();

  // populate select
  for (let i = 0; i < instruments.length; i++) {
    const instrument = instruments[i];
    if (group !== instrument.group) {
      group = instrument.group;
      if ($optGroup) {
        $select.append($optGroup);
      }
      $optGroup = $("<optgroup></optgroup>").attr("label", group);
    }
    const $option = $("<option></option>")
      .val(i)
      .text(i + ": " + instrument.name);
    if (i === 0) {
      $option.attr("selected", "selected");
    }
    $optGroup.append($option);
  }
  $select.append($optGroup);
};
