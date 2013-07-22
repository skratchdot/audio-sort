(function (global) {
	'use strict';

	global.fn.datagen.reverse = function (size) {
		return global.fn.datagen.sorted(size).reverse();
	};

}(this));