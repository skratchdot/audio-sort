/*!
 * Project: Audio Sort
 *    File: A.Helper.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
/*global A, $, sc */
(function (global) {
	'use strict';

	var Helper = {},
		// functions
		getMidiNumberHelper;

	getMidiNumberHelper = function (degrees, degreeSize, octaveSize, position) {
		return degrees[position % degreeSize] + (Math.floor(position / degreeSize) * octaveSize);
	};

	Helper.getMidiNumber = function (playValue) {
		var scale, octaveSize, degrees, degreeSize, centerValue, playMidi, centerMidi;

		// get some info from our current scale
		scale = sc.ScaleInfo.at(A.Sort.getSelected('scale'));
		octaveSize = scale.pitchesPerOctave();
		degrees = scale.degrees();
		degreeSize = degrees.length;
		centerValue = Math.floor(A.Sort.getSelected('dataSize') / 2);

		playMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, playValue);
		centerMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, centerValue);

		return playMidi + A.Sort.getSelected('centerNote') - centerMidi;
	};

	Helper.createSlider = function (selector, obj, onChange) {
		var $container = $(selector), $elem = $('<div class="audio-sort-slider"></div>'), $slider;
		$container.empty();
		$elem.appendTo($container);
		$slider = $elem.slider({
			value: obj.value,
			min: obj.min,
			max: obj.max,
			step: obj.step,
			orientation: 'horizontal',
			selection: 'none',
			tooltip: 'hide'
		});
		$slider.on('slide', onChange);
		$slider.on('slideStop', onChange);
		$(selector + ' .slider').width('100%');
		return $slider;
	};

	// add Helper to the global scope
	global.A.Helper = Helper;
}(this));