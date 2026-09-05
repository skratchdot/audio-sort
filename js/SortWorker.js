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
  "use strict";

  var getFunctionBody, getMethod;

  getFunctionBody = function (fn) {
    var source = fn.toString(),
      bodyStart = source.indexOf("{"),
      bodyEnd = source.lastIndexOf("}");

    if (bodyStart === -1 || bodyEnd <= bodyStart) {
      return source;
    }

    return source.slice(bodyStart + 1, bodyEnd);
  };

  getMethod = function (method) {
    var defaultMethod = "bubble";
    method = method || defaultMethod;
    if (!sort.hasOwnProperty(method)) {
      method = defaultMethod;
    }
    return method;
  };

  global.onmessage = function (event) {
    var Fn = Function,
      obj = {},
      token = new Date().getTime(),
      frames;

    // ensure obj is valid
    obj.key = event.data.key || "";
    obj.fn = event.data.fn || "function () {\n}";
    obj.arr = event.data.arr || [];

    // convert our function
    obj.fn = new Fn(getFunctionBody(obj.fn));

    // get result
    AS.init(obj.arr, token);
    obj.fn();
    frames = AS.end(token);

    // return result
    global.postMessage({
      key: obj.key,
      frames: frames,
      fn: obj.fn.toString(),
    });
  };
})(globalThis);
