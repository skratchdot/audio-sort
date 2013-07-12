(function (global) {
	'use strict';

	var AS = {},
		// internal arrays
		_array = [],
		_frames = [],
		_token = '',
		// state
		recent = {
			play: [],
			mark: [],
			swap: [],
			compare: [],
			highlight: []
		},
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
			id: isObject ? obj.id : _token + '_' + obj,
			value: isObject ? obj.value : obj,
			play: isObject ? obj.play : false,
			mark: isObject ? obj.mark : false,
			swap: isObject ? obj.swap : false,
			justSwapped: isObject ? obj.justSwapped : false,
			compare: isObject ? obj.compare : false,
			highlight: isObject ? obj.highlight : false
		};
		return result;
	};
	
	frameCheck = function (type) {
		if (_frames.length === 0 || (recent.hasOwnProperty(type) && recent[type].length)) {
			addFrame();
		}
	};

	addFrame = function () {
		var i, copy = [], obj;
		for (i = 0; i < _array.length; i++) {
			obj = copyObject(_array[i]);
			// justSwapped
			if (recent.swap.indexOf(obj.id) >= 0) {
				obj.justSwapped = true;
			}
			// highlight
			if (recent.highlight.indexOf(obj.id) >= 0) {
				obj.highlight = true;
			}
			copy.push(obj);
		}
		_frames.push({
			arr: copy,
			compareCount: compareCount,
			swapCount: swapCount
		});
		recent.play = [];
		recent.mark = [];
		recent.swap = [];
		recent.compare = [];
	};

	compare = function (one, two) {
		mark('compare', [one, two]);
		compareCount++;
		_frames[_frames.length - 1].compareCount = compareCount;
	};

	mark = function (type, indexes) {
		var frameIndex, len, i, index;
		frameCheck(type);
		frameIndex = _frames.length - 1;
		len = _frames[frameIndex].arr.length;
		for (i = 0; i < indexes.length; i++) {
			index = indexes[i];
			if (index >= 0 && index < len) {
				_frames[frameIndex].arr[index][type] = true;
				if (recent.hasOwnProperty(type)) {
					recent[type].push(_frames[frameIndex].arr[index].id);
				}
			}
		}
	};

	AS.getFrames = function () {
		return _frames;
	};

	AS.init = function (inputArray, token) {
		var i;
		_array = [];
		_frames = [];
		_token = token;
		compareCount = 0;
		swapCount = 0;
		for (i = 0; i < inputArray.length; i++) {
			_array.push(copyObject(inputArray[i]));
		}
	};
	
	AS.end = function (token) {
		var i, lastFrameArray;
		if (_token === token) {
			// handle empty frames
			if (_frames.length === 0) {
				addFrame();
			}
			// handle the case in which last frame doesn't match _array
			lastFrameArray = _frames[_frames.length - 1].arr;
			for (i = 0; i < _array.length; i++) {
				if (_array[i].id !== lastFrameArray) {
					addFrame();
					return _frames;
				}
			}
			// we didn't have to artificially add a new frame
			return _frames;
		} else {
			// someone besides the worker was trying to call AS.end();
			return [];
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
		mark('play', arguments);
	};

	AS.mark = function () {
		mark('mark', arguments);
	};

	AS.clearHighlight = function () {
		recent.highlight = [];
	};

	AS.highlight = function () {
		AS.clearHighlight();
		mark('highlight', arguments);
	};
	
	AS.get = function (index) {
		return _array[index].value;
	};

	AS.swap = function (one, two) {
		var tempOne, tempTwo;
		// mark as swapped
		mark('swap', [one, two]);
		// perform swap
		tempOne = _array[one];
		tempTwo = _array[two];
		_array[one] = tempTwo;
		_array[two] = tempOne;
		swapCount++;
		_frames[_frames.length - 1].swapCount = swapCount;
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
			token = (new Date()).getTime(),
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
		AS.init(obj.arr, token);
		obj.fn();
		frames = AS.end(token);

		// return result
		global.postMessage({
			key: obj.key,
			frames: frames,
			fn: obj.fn.toString()
		});
	};

}(this));