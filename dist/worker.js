(function (global) {
	'use strict';

	var AS = {},
		// internal arrays
		_array = [],
		_frames = [],
		// state
		needNext = true,
		// counters
		compareCount = 0,
		swapCount = 0,
		// functions
		addFrame,
		compare,
		copyObject,
		frameCheck,
		mark;

	copyObject = function (obj) {
		var isObject = (typeof obj === 'object'), result;
		result = {
			value: isObject ? obj.value : obj,
			play: isObject ? obj.play : false,
			swap: isObject ? obj.swap : false,
			compare: isObject ? obj.compare : false,
			mark: isObject ? obj.mark : false,
			markTwo: isObject ? obj.markTwo : false
		};
		return result;
	};
	
	frameCheck = function () {
		if (needNext) {
			addFrame();
		}
		needNext = false;
	};

	addFrame = function () {
		var i, copy = [];
		for (i = 0; i < _array.length; i++) {
			copy.push(copyObject(_array[i]));
		}
		_frames.push({
			arr: copy,
			compareCount: compareCount,
			swapCount: swapCount
		});
	};

	compare = function (one, two) {
		mark('compare', one);
		mark('compare', two);
		compareCount++;
		_frames[_frames.length - 1].compareCount = compareCount;
	};

	mark = function (type, index) {
		var frameIndex, len;
		frameCheck();
		frameIndex = _frames.length - 1;
		len = _frames[frameIndex].arr.length;
		if (index >= 0 && index < len) {
			_frames[frameIndex].arr[index][type] = true;
		}
	};

	AS.getFrames = function () {
		return _frames;
	};

	AS.init = function (inputArray) {
		var i;
		_array = [];
		_frames = [];
		needNext = true;
		compareCount = 0;
		swapCount = 0;
		for (i = 0; i < inputArray.length; i++) {
			_array.push(copyObject(inputArray[i]));
		}
	};
	
	AS.length = function () {
		return _array.length;
	};
	
	AS.size = AS.length;

	AS.lt = function (one, two) {
		compare(one, two);
		return AS.get(one) < AS.get(two);
	};

	AS.lte = function (one, two) {
		compare(one, two);
		return AS.get(one) <= AS.get(two);
	};

	AS.gt = function (one, two) {
		compare(one, two);
		return AS.get(one) > AS.get(two);
	};

	AS.gte = function (one, two) {
		compare(one, two);
		return AS.get(one) >= AS.get(two);
	};

	AS.eq = function (one, two) {
		compare(one, two);
		return AS.get(one) === AS.get(two);
	};

	AS.neq = function (one, two) {
		compare(one, two);
		return AS.get(one) !== AS.get(two);
	};

	AS.play = function () {
		var i;
		for (i = 0; i < arguments.length; i++) {
			mark('play', arguments[i]);
		}
	};

	AS.mark = function () {
		var i;
		for (i = 0; i < arguments.length; i++) {
			mark('mark', arguments[i]);
		}
	};

	AS.markTwo = function () {
		var i;
		for (i = 0; i < arguments.length; i++) {
			mark('markTwo', arguments[i]);
		}
	};
	
	AS.get = function (index) {
		return _array[index].value;
	};

	AS.swap = function (one, two) {
		var tempOne, tempTwo;
		// mark as swapped
		mark('swap', one);
		mark('swap', two);
		// perform swap
		tempOne = _array[one];
		tempTwo = _array[two];
		_array[one] = tempTwo;
		_array[two] = tempOne;
		swapCount++;
		_frames[_frames.length - 1].swapCount = swapCount;
		needNext = true;
	};
	
	AS.next = function () {
		addFrame();
		needNext = false;
	};

	global.AS = AS;
}(this));
/*global sort */
(function (global) {
	'use strict';

	var getMethod;

	getMethod = function (method) {
		var defaultMethod = 'bubble';
		method = method || defaultMethod;
		if (!sort.hasOwnProperty(method)) {
			method = defaultMethod;
		}
		return method;
	};

	global.onmessage = function (event) {
		var Fn = Function,
			obj = {},
			fnArray,
			frames;

		// ensure obj is valid
		obj.key = event.data.key || '';
		obj.fn = event.data.fn || 'function () {\n}';
		obj.arr = event.data.arr || [];

		// convert our function
		fnArray = obj.fn.split('\n');
		obj.fn = fnArray.splice(1, fnArray.length - 2).join('\n');
		obj.fn = new Fn(obj.fn);

		// get result
		AS.init(obj.arr);
		obj.fn();
		frames = AS.getFrames();
		if (frames.length === 0) {
			AS.next();
			frames = AS.getFrames();
		}

		// return result
		global.postMessage({
			key: obj.key,
			frames: frames,
			fn: obj.fn.toString()
		});
	};

}(this));