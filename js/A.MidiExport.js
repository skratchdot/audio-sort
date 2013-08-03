/*!
 * Project: Audio Sort
 *    File: A.MidiExport.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
/*global $, A */
(function (global) {
	'use strict';

	var MidiExport = {};

	MidiExport.populateChannels = function (selector) {
		var i, $select = $(selector), $option, html = '', numChannels = 16;

		// empty select
		$select.empty();

		// populate select
		for (i = 0; i < numChannels; i++) {
			$option = $('<option></option>')
				.val(i)
				.text(i);
			if (i === 0) {
				$option.attr('selected', 'selected');
			}
			html += $option.wrap('<div />').parent().html();
		}
		$select.append(html);
	};

	MidiExport.populateInstruments = function (selector) {
		var i, instrument, group = '',
			$select = $(selector), $optGroup, $option;

		// empty select
		$select.empty();

		// populate select
		for (i = 0; i < A.instruments.length; i++) {
			instrument = A.instruments[i];
			if (group !== instrument.group) {
				group = instrument.group;
				if ($optGroup) {
					$select.append($optGroup);
				}
				$optGroup = $('<optgroup></optgroup>')
					.attr('label', group);
			}
			$option = $('<option></option>')
				.val(i)
				.text(instrument.name);
			if (i === 0) {
				$option.attr('selected', 'selected');
			}
			$optGroup.append($option);
		}
		$select.append($optGroup);
	};

	global.A.MidiExport = MidiExport;
}(this));