/*!
 * Project: Audio Sort
 *    File: AudioHelper.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
/*global sc, AudioSort */
(function (global) {
	'use strict';

	var AudioHelper = {},
		// functions
		getMidiNumberHelper;

	getMidiNumberHelper = function (degrees, degreeSize, octaveSize, position) {
		return degrees[position % degreeSize] + (Math.floor(position / degreeSize) * octaveSize);
	};

	AudioHelper.getMidiNumber = function (playValue) {
		var scale, octaveSize, degrees, degreeSize, centerValue, playMidi, centerMidi;

		// get some info from our current scale
		scale = sc.ScaleInfo.at(AudioSort.getSelected('scale'));
		octaveSize = scale.pitchesPerOctave();
		degrees = scale.degrees();
		degreeSize = degrees.length;
		centerValue = Math.floor(AudioSort.getSelected('dataSize') / 2);

		playMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, playValue);
		centerMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, centerValue);

		return playMidi + AudioSort.getSelected('centerNote') - centerMidi;
	};

	// add AudioHelper to the global scope
	global.AudioHelper = AudioHelper;
}(this));