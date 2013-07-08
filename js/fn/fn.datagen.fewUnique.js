(function (global) {
	'use strict';

	var fewUniqueSize = 4;

	global.fn.datagen.fewUnique = function (size) {
		var i, ret = [];
		for (i = 0; i < size; i++) {
			ret.push(size - 1 - (Math.floor(size / fewUniqueSize) * (i % fewUniqueSize)));
		}
		return global.fn.shuffle(ret);
	};
	
}(this));