(function (global) {
	'use strict';

	global.fn.datagen.sorted = function (size) {
		var i, ret = [];
		for (i = 0; i < size; i++) {
			ret.push(i);
		}
		return ret;
	};

}(this));