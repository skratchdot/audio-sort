/*!
 * Project: Audio Sort
 *    File: A.Helper.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
/*global sc, A */
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

	// add Helper to the global scope
	global.A.Helper = Helper;
}(this));