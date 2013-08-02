/*!
 * Project: Audio Sort
 *    File: SortWorker.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
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