(function (global) {
	'use strict';
	
	global.fn.swap = function (arr, one, two) {
		var len = arr.length, tempOne, tempTwo;
		one = parseInt(one, 10) || 0;
		two = parseInt(two, 10) || 0;
		if (one !== two && one >= 0 && two >= 0 && one < len && two < len) {
			tempOne = arr[one];
			tempTwo = arr[two];
			arr[one] = tempTwo;
			arr[two] = tempOne;
		}
		return arr;
	};
	
}(this));