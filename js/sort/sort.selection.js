(function (global) {
	'use strict';

	// a slightly modified version of:
	// https://github.com/nzakas/computer-science-in-javascript/blob/master/algorithms/sorting/selection-sort/selection-sort.js
	global.sort.selection = function () {
		var len = AS.length(), min, i, j;

		for (i = 0; i < len; i++) {
			min = i;
			for (j = i + 1; j < len; j++) {
				AS.play(j);
				AS.mark(i, j);
				if (AS.lt(j, min)) {
					min = j;
				}
				AS.next();
			}
			if (i !== min) {
				AS.swap(i, min);
			}
		}
		AS.next();
    };

	global.sort.selection.display = 'Selection';
	global.sort.selection.stable = false;
	global.sort.selection.best = 'n^2';
	global.sort.selection.average = 'n^2';
	global.sort.selection.worst = 'n^2';
	global.sort.selection.memory = '1';
	global.sort.selection.method = 'selection';
}(this));