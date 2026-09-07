/*!
 * Project: Audio Sort
 *    File: create-sort-engine.mjs
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
// Each instance owns its arrays, frames, markers, and counters.
export function createSortEngine() {
  const AS = {};
  // internal arrays
  let _array = [];
  let _frames = [];
  let _token = "";
  // state
  const recent = {
    play: [],
    mark: [],
    swap: [],
    compare: [],
    highlight: [],
  };
  // counters
  let compareCount = 0;
  let swapCount = 0;

  const copyObject = function (obj) {
    const isObject = typeof obj === "object";
    const rand = parseInt(Math.random() * 10000000, 10);

    const result = {
      id: isObject ? obj.id : rand + "_" + obj,
      value: isObject ? obj.value : obj,
      play: isObject ? obj.play : false,
      mark: isObject ? obj.mark : false,
      swap: isObject ? obj.swap : false,
      justSwapped: isObject ? obj.justSwapped : false,
      compare: isObject ? obj.compare : false,
      highlight: isObject ? obj.highlight : false,
    };
    return result;
  };

  const frameCheck = function (type) {
    if (_frames.length === 0 || (recent.hasOwnProperty(type) && recent[type].length)) {
      addFrame();
    }
  };

  const addFrame = function () {
    const copy = [];

    for (let i = 0; i < _array.length; i++) {
      const obj = copyObject(_array[i]);
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
      swapCount: swapCount,
    });
    recent.play = [];
    recent.mark = [];
    recent.swap = [];
    recent.compare = [];
  };

  const getIndexFromSortObject = function (obj) {
    for (let i = 0; i < _array.length; i++) {
      if (_array[i].id === obj.id) {
        return i;
      }
    }
    return -1;
  };

  const getSortObjects = function (inputArray) {
    const ret = [];
    for (let i = 0; i < inputArray.length; i++) {
      let current = inputArray[i];
      if (typeof current === "number") {
        current = AS.get(current);
      }
      ret.push(current);
    }
    return ret;
  };

  const compare = function (one, two) {
    const sortObjects = mark("compare", [one, two]);
    compareCount++;
    _frames[_frames.length - 1].compareCount = compareCount;
    return sortObjects;
  };

  const mark = function (type, inputArray) {
    const sortObjects = getSortObjects(inputArray);
    frameCheck(type);
    const frameIndex = _frames.length - 1;
    const len = _frames[frameIndex].arr.length;
    for (let i = 0; i < sortObjects.length; i++) {
      const index = getIndexFromSortObject(sortObjects[i]);
      if (index >= 0 && index < len) {
        _frames[frameIndex].arr[index][type] = true;
        if (recent.hasOwnProperty(type)) {
          recent[type].push(_frames[frameIndex].arr[index].id);
        }
      }
    }
    return sortObjects;
  };

  AS.getFrames = function () {
    return _frames;
  };

  AS.init = function (inputArray, token) {
    _array = [];
    _frames = [];
    _token = token;
    compareCount = 0;
    swapCount = 0;
    // Reusing an instance must not carry marker IDs into the next data set.
    for (const type of Object.keys(recent)) recent[type] = [];
    for (let i = 0; i < inputArray.length; i++) {
      _array.push(copyObject(inputArray[i]));
    }
  };

  AS.end = function (token) {
    if (_token === token) {
      // handle empty frames
      if (_frames.length === 0) {
        addFrame();
      }
      // handle the case in which last frame doesn't match _array
      const lastFrameArray = _frames[_frames.length - 1].arr;
      for (let i = 0; i < _array.length; i++) {
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
    const sortObjects = compare(one, two);
    return sortObjects[0].value < sortObjects[1].value;
  };

  AS.lte = function (one, two) {
    const sortObjects = compare(one, two);
    return sortObjects[0].value <= sortObjects[1].value;
  };

  AS.gt = function (one, two) {
    const sortObjects = compare(one, two);
    return sortObjects[0].value > sortObjects[1].value;
  };

  AS.gte = function (one, two) {
    const sortObjects = compare(one, two);
    return sortObjects[0].value >= sortObjects[1].value;
  };

  AS.eq = function (one, two) {
    const sortObjects = compare(one, two);
    return sortObjects[0].value === sortObjects[1].value;
  };

  AS.neq = function (one, two) {
    const sortObjects = compare(one, two);
    return sortObjects[0].value !== sortObjects[1].value;
  };

  AS.play = function () {
    mark("play", arguments);
  };

  AS.mark = function () {
    mark("mark", arguments);
  };

  AS.clearHighlight = function () {
    recent.highlight = [];
  };

  AS.highlight = function () {
    AS.clearHighlight();
    mark("highlight", arguments);
  };

  AS.get = function (index) {
    return copyObject(_array[index]);
  };

  AS.swap = function (one, two) {
    // mark as swapped
    const sortObjects = mark("swap", [one, two]);
    const indexOne = getIndexFromSortObject(sortObjects[0]);
    const indexTwo = getIndexFromSortObject(sortObjects[1]);
    // perform swap
    const tempOne = _array[indexOne];
    const tempTwo = _array[indexTwo];
    _array[indexOne] = tempTwo;
    _array[indexTwo] = tempOne;
    swapCount++;
    _frames[_frames.length - 1].swapCount = swapCount;
  };

  return AS;
}
