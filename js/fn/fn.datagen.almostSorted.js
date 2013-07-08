(function (global) {
	'use strict';

	var almostSortedFactor = 2;

	global.fn.datagen.almostSorted = function (size) {
		var ret = global.fn.datagen.sorted(size), used = [], swapTry, i, len = ret.length;
		for (i = 0; i < len; i++) {
			swapTry = global.fn.random(i, Math.min(i + almostSortedFactor, len - 1));
			if (used.indexOf(i) < 0 && used.indexOf(swapTry) < 0) {
				used.push(i);
				used.push(swapTry);
				global.fn.swap(ret, i, swapTry);
			}
		}
		return ret;
	};
	
}(this));