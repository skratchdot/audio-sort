(function (global) {
	'use strict';

	global.sort.quick = function () {
		var partition, quickSort;

		// a slightly modified version of:
		// https://raw.github.com/nzakas/computer-science-in-javascript/master/algorithms/sorting/quicksort/quicksort.js
		partition = function (left, right) {
			var pivotIndex = Math.floor((right + left) / 2),
				pivotValue = AS.get(pivotIndex),
				i = left,
				j = right;

			// while the two indices don't match
			while (i <= j) {

				// if the item on the left is less than the pivot, continue right
				while (AS.get(i) < pivotValue) {
					AS.play(i, j);
					AS.mark(i, j);
					AS.markTwo(pivotIndex);
					AS.next();
					i++;
				}

				// if the item on the right is greater than the pivot, continue left
				while (AS.get(j) > pivotValue) {
					AS.play(i, j);
					AS.mark(i, j);
					AS.markTwo(pivotIndex);
					AS.next();
					j--;
				}

				// if the two indices still don't match, swap the values
				if (i <= j) {
					AS.play(i, j);
					AS.mark(i, j);
					AS.markTwo(pivotIndex);
					AS.swap(i, j);
					AS.next();
					// change indices to continue loop
					i++;
					j--;
				}
			}

			// this value is necessary for recursion
			return i;
		};

		// a slightly modified version of:
		// https://raw.github.com/nzakas/computer-science-in-javascript/master/algorithms/sorting/quicksort/quicksort.js
		quickSort = function (left, right) {

			var index, len = AS.length();

			// performance - don't sort an array with zero or one items
			if (len > 1) {

				// fix left and right values - might not be provided
				left = typeof left !== 'number' ? 0 : left;
				right = typeof right !== 'number' ? len - 1 : right;

				AS.mark(left, right);

				// split up the entire array
				index = partition(left, right);

				// if the returned index
				if (left < index - 1) {
					quickSort(left, index - 1);
				}

				if (index < right) {
					quickSort(index, right);
				}

			}
		};
		
		quickSort();
	};

	global.sort.quick.display = 'Quick';
	global.sort.quick.stable = true;
	global.sort.quick.best = 'n';
	global.sort.quick.average = 'n^2';
	global.sort.quick.worst = 'n^2';
	global.sort.quick.memory = '1';
	global.sort.quick.method = 'exchanging';
}(this));