(function (global) {
	'use strict';

	// slightly modified version of:
	// https://github.com/nzakas/computer-science-in-javascript/blob/master/algorithms/sorting/insertion-sort/insertion-sort.js
	global.sort.insertion = function () {
		var len = AS.length(), i, j, firstValue, secondValue;

		for (i = 0; i < len; i++) {
			firstValue = AS.get(i);
			for (j = i - 1; j > -1; j--) {
				secondValue = AS.get(j);
				AS.play(j);
				AS.gt(j, i); // just marking as a compare
				if (secondValue > firstValue) {
					AS.swap(j, j + 1);
				}
			}
		}
	};

	global.sort.insertion.display = 'Insertion';
	global.sort.insertion.stable = true;
	global.sort.insertion.best = 'n';
	global.sort.insertion.average = 'n^2';
	global.sort.insertion.worst = 'n^2';
	global.sort.insertion.memory = '1';
	global.sort.insertion.method = 'insertion';
}(this));