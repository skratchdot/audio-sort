(function (global) {
	'use strict';
	
	global.fn.datagen.randomUnique = function (size) {
		return global.fn.shuffle(global.fn.datagen.sorted(size));
	};
	
}(this));