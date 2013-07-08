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