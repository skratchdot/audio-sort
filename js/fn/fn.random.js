(function (global) {
	'use strict';

	global.fn.random = function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

}(this));