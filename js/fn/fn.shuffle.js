(function (global) {
	'use strict';

	// shuffle function is the fisherYates algorithm adapted from:
	// http://sedition.com/perl/javascript-fy.html
	global.fn.shuffle = function (arr) {
		var i = arr.length, j;
		if (i === 0) {
			return arr;
		}
		while (--i) {
			j = Math.floor(Math.random() * (i + 1));
			arr = global.fn.swap(arr, i, j);
		}
		return arr;
	};
	
}(this));