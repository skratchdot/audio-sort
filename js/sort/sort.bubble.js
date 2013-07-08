(function (global) {
	'use strict';

	global.sort.bubble = function () {
		var i, swapped, endIndex = AS.length();
		do {
			swapped = false;
			for (i = 0; i < endIndex - 1; i++) {
				AS.play(i);
				AS.mark(i);
				if (AS.lt(i + 1, i)) {
					AS.swap(i + 1, i);
					swapped = true;
				}
				AS.next();
			}
			endIndex--;
		} while(swapped);
		AS.play(i);
	};

	global.sort.bubble.display = 'Bubble';
	global.sort.bubble.stable = true;
	global.sort.bubble.best = 'n';
	global.sort.bubble.average = 'n^2';
	global.sort.bubble.worst = 'n^2';
	global.sort.bubble.memory = '1';
	global.sort.bubble.method = 'exchanging';
}(this));