'use strict';

var sort = require('../dist/sort.js'),
	sizes = [5, 10],
	sortedFive = [0, 1, 2, 3, 4],
	sortedTen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
	test.expect(numAssertions)
	test.done()
  Test assertions:
	test.ok(value, [message])
	test.equal(actual, expected, [message])
	test.notEqual(actual, expected, [message])
	test.deepEqual(actual, expected, [message])
	test.notDeepEqual(actual, expected, [message])
	test.strictEqual(actual, expected, [message])
	test.notStrictEqual(actual, expected, [message])
	test.throws(block, [error], [message])
	test.doesNotThrow(block, [error], [message])
	test.ifError(value)
*/

exports['AudioSortTests'] = {
	setUp: function (done) {
		// setup here
		done();
	},
	'fn.datagen (array lengths)': function (test) {
		test.expect(sizes.length * 6);

		// test array size
		sizes.forEach(function (size) {
			test.equal(sort.fn.datagen.sorted(size).length, size, 'array length should be: ' + size);
			test.equal(sort.fn.datagen.reverse(size).length, size, 'array length should be: ' + size);
			test.equal(sort.fn.datagen.randomDupes(size).length, size, 'array length should be: ' + size);
			test.equal(sort.fn.datagen.randomUnique(size).length, size, 'array length should be: ' + size);
			test.equal(sort.fn.datagen.almostSorted(size).length, size, 'array length should be: ' + size);
			test.equal(sort.fn.datagen.fewUnique(size).length, size, 'array length should be: ' + size);
		});

		test.done();
	},
	'fn.datagen.sorted': function (test) {
		test.expect(2);
		test.deepEqual(sort.fn.datagen.sorted(5), sortedFive, 'array is not sorted');
		test.deepEqual(sort.fn.datagen.sorted(10), sortedTen, 'array is not sorted');
		test.done();
	}
};
