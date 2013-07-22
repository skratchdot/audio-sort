(function (global) {
	'use strict';

	global.fn.datagen.randomDupes = function (size) {
		var i, ret = [];
		for (i = 0; i < size; i++) {
			ret.push(Math.floor(Math.random() * (size)));
		}
		return ret;
	};

}(this));