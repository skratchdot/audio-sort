(function (global) {
	'use strict';
	global.fn = global.fn || {
		datagen: {}
	};
}(this));
(function (global) {
	'use strict';

	var almostSortedFactor = 2;

	global.fn.datagen.almostSorted = function (size) {
		var ret = global.fn.datagen.sorted(size), used = [], swapTry, i, len = ret.length;
		for (i = 0; i < len; i++) {
			swapTry = global.fn.random(i, Math.min(i + almostSortedFactor, len - 1));
			if (used.indexOf(i) < 0 && used.indexOf(swapTry) < 0) {
				used.push(i);
				used.push(swapTry);
				global.fn.swap(ret, i, swapTry);
			}
		}
		return ret;
	};

}(this));
(function (global) {
	'use strict';

	var fewUniqueSize = 4;

	global.fn.datagen.fewUnique = function (size) {
		var i, ret = [];
		for (i = 0; i < size; i++) {
			ret.push(size - 1 - (Math.floor(size / fewUniqueSize) * (i % fewUniqueSize)));
		}
		return global.fn.shuffle(ret);
	};

}(this));
(function (global) {
	'use strict';

	global.fn.datagen.randomDupes = function (size) {
		var i, ret = [];
		for (i = 0; i < size; i++) {
			ret.push(Math.floor(Math.random() * (size)));
		}
		return ret;
	};

}(this));
(function (global) {
	'use strict';

	global.fn.datagen.randomUnique = function (size) {
		return global.fn.shuffle(global.fn.datagen.sorted(size));
	};

}(this));
(function (global) {
	'use strict';

	global.fn.datagen.reverse = function (size) {
		return global.fn.datagen.sorted(size).reverse();
	};

}(this));
(function (global) {
	'use strict';

	global.fn.datagen.sorted = function (size) {
		var i, ret = [];
		for (i = 0; i < size; i++) {
			ret.push(i);
		}
		return ret;
	};

}(this));
(function (global) {
	'use strict';

	global.fn.random = function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

}(this));
(function (global) {
	'use strict';

	// shuffle function is the fisherYates algorithm adapted from:
	// http://sedition.com/perl/javascript-fy.html
	global.fn.shuffle = function (arr) {
		var i = arr.length, j;
		if (i === 0) {
			return arr;
		}
		while (--i) {
			j = Math.floor(Math.random() * (i + 1));
			arr = global.fn.swap(arr, i, j);
		}
		return arr;
	};

}(this));
(function (global) {
	'use strict';

	global.fn.swap = function (arr, one, two) {
		var len = arr.length, tempOne, tempTwo;
		one = parseInt(one, 10) || 0;
		two = parseInt(two, 10) || 0;
		if (one !== two && one >= 0 && two >= 0 && one < len && two < len) {
			tempOne = arr[one];
			tempTwo = arr[two];
			arr[one] = tempTwo;
			arr[two] = tempOne;
		}
		return arr;
	};

}(this));
(function (global) {
	'use strict';
	global.sort = global.sort || {};
}(this));
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
(function (global) {
	'use strict';

	// slightly modified version of:
	// https://github.com/nzakas/computer-science-in-javascript/blob/master/algorithms/sorting/insertion-sort/insertion-sort.js
	global.sort.insertion = function () {
		var len = AS.length(), i, j, firstValue, secondValue;

		for (i = 0; i < len; i++) {
			firstValue = AS.get(i);
			for (j = i - 1; j > -1; j--) {
				secondValue = AS.get(j);
				AS.play(j);
				if (AS.gt(secondValue, firstValue)) {
					AS.swap(j, j + 1);
				}
			}
		}
	};

	global.sort.insertion.display = 'Insertion';
	global.sort.insertion.stable = true;
	global.sort.insertion.best = 'n';
	global.sort.insertion.average = 'n^2';
	global.sort.insertion.worst = 'n^2';
	global.sort.insertion.memory = '1';
	global.sort.insertion.method = 'insertion';
}(this));
(function (global) {
	'use strict';

	// a slightly modified version of:
	// https://raw.github.com/nzakas/computer-science-in-javascript/master/algorithms/sorting/quicksort/quicksort.js
	global.sort.quick = function () {
		var partition, quickSort;

		partition = function (left, right) {
			var pivotIndex = Math.floor((right + left) / 2),
				pivotValue = AS.get(pivotIndex),
				i = left,
				j = right;

			AS.clearHighlight();
			AS.play(i, j);
			AS.mark(i, j);
			AS.highlight(i, j, pivotIndex);

			// while the two indices don't match
			while (i <= j) {

				// if the item on the left is less than the pivot, continue right
				while (AS.lt(AS.get(i), pivotValue)) {
					AS.play(i, j);
					AS.mark(i, j);
					i++;
				}

				// if the item on the right is greater than the pivot, continue left
				while (AS.gt(AS.get(j), pivotValue)) {
					AS.play(i, j);
					AS.mark(i, j);
					j--;
				}

				// if the two indices still don't match, swap the values
				if (i <= j) {
					AS.play(i, j);
					AS.mark(i, j);
					AS.swap(i, j);
					// change indices to continue loop
					i++;
					j--;
				}
			}

			AS.clearHighlight();

			// this value is necessary for recursion
			return i;
		};

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
			}
			if (i !== min) {
				AS.swap(i, min);
			}
		}
    };

	global.sort.selection.display = 'Selection';
	global.sort.selection.stable = false;
	global.sort.selection.best = 'n^2';
	global.sort.selection.average = 'n^2';
	global.sort.selection.worst = 'n^2';
	global.sort.selection.memory = '1';
	global.sort.selection.method = 'selection';
}(this));
(function (global) {
	'use strict';
	global.visualization = global.visualization || {};
}(this));
/*global $ */
(function (global) {
	'use strict';

	var hoverIndex = -1,
		hoverValue = -1,
		clickIndex = -1,
		clickValue = -1,
		isClicking = false;

	global.visualization.bar = function (settings) {
		var bar = {},
			// settings
			data, $svg, svg,
			hasMarkers,
			onClick,
			// function
			_init,
			drawMarkers,
			getIndexAndValueFromMouse;

		_init = function (settings) {
			data = settings.data;
			svg = settings.svg;
			$svg = settings.$svg;
			$svg.removeAttr('preserveAspectRatio');
			$svg.removeAttr('viewBox');
			hasMarkers = settings.hasMarkers;
			onClick = settings.onClick;
		};

		drawMarkers = function (info, level, property) {
			var circle, len, radius, cy;
			if (hasMarkers) {
				// select some items
				circle = svg.selectAll('circle.' + property).data(info.arr);
				len = info.arr.length;

				// create
				circle.enter().append('circle');

				// determine our radius and our y position
				radius = 100 / (Math.max(len, 20) * 4);
				cy = 100 - (level * 10) + '%';

				// update
				circle
					.attr('cy', cy)
					.attr('cx', function (d, i) {
						var width = (100 / (len * 2));
						return (((i / len) * 100) + width) + '%';
					})
					.attr('r', function () {
						return radius + '%';
					})
					.attr('class', property)
					.attr('style', function (d) {
						return d[property] ? '' : 'display:none';
					});

				// exit
				circle.exit().remove();
			}
		};

		getIndexAndValueFromMouse = function (e) {
			var index, value, $this = $(e.currentTarget),
				$parent = $this.parent(), parentOffset,
				relX, relY, w, h, n = 0, min = 0;

			// set relative positions
			parentOffset = $parent.offset();
			relX = e.pageX - parentOffset.left;
			relY = e.pageY - parentOffset.top;

			// account for border/margin/padding
			relX = relX - parseInt($parent.css('border-left-width'), 10);
			relX = relX - parseInt($parent.css('margin-left'), 10);
			relX = relX - parseInt($parent.css('padding-left'), 10);
			relY = relY - parseInt($parent.css('border-top-width'), 10);
			relY = relY - parseInt($parent.css('margin-top'), 10);
			relY = relY - parseInt($parent.css('padding-top'), 10);

			// store widths and heights
			w = $this.parent().width();
			h = $this.parent().height();

			// get datasize
			if (data.length > 0) {
				n = data[0].arr.length;
				min = n - 1;
			}

			// set index/value
			index = Math.floor((relX / w) * n);
			value = Math.floor((relY / h) * n);

			// account for div/0
			index = isFinite(index) ? index : 0;
			value = isFinite(value) ? value : 0;

			// handle offset errors
			index = Math.min(min, index);
			value = Math.min(min, value);
			value = min - value;

			return {
				index: index,
				value: value
			};
		};

		bar.onMouseMove = function (e) {
			var result = getIndexAndValueFromMouse(e), $rect;
			if (hoverIndex !== result.index) {
				hoverIndex = result.index;
				$rect = $svg.find('rect');
				$rect.attr('opacity', 1);
				$rect.eq(hoverIndex).attr('opacity', 0.5);
			}
			hoverValue = result.value;
			if (isClicking && (hoverIndex !== clickIndex || hoverValue !== clickValue)) {
				clickIndex = hoverIndex;
				clickValue = hoverValue;
				onClick(clickIndex, clickValue);
			}
		};

		bar.onMouseOut = function () {
			hoverIndex = -1;
			$svg.find('rect').attr('opacity', 1);
		};

		bar.onMouseDown = function (e) {
			var result = getIndexAndValueFromMouse(e);
			e.preventDefault();
			isClicking = true;
			clickIndex = result.index;
			clickValue = result.value;
			onClick(clickIndex, clickValue);
		};

		bar.onMouseUp = function () {
			isClicking = false;
			clickIndex = -1;
			clickValue = -1;
		};

		bar.draw = function (index) {
			var info, rect, len;

			// draw it
			if (data.length > 0) {
				info = data[index];

				// select some items
				rect = svg.selectAll('rect').data(info.arr);
				len = info.arr.length;

				// create
				rect.enter().append('rect');

				// update
				rect
					.attr('width', function () {
						return (100 / len) + '%';
					})
					.attr('height', function (d) {
						return ((100 / len) * (d.value + 1)) + '%';
					})
					.attr('x', function (d, i) {
						return ((i / len) * 100) + '%';
					})
					.attr('y', function (d) {
						return (100 - ((100 / len) * (d.value + 1))) + '%';
					})
					.attr('class', function (d) {
						return d.play ? 'play' : '';
					});

				// exit
				rect.exit().remove();

				// draw our markers
				drawMarkers(info, 1, 'highlight');
				drawMarkers(info, 2, 'justSwapped');
				drawMarkers(info, 3, 'swap');
				drawMarkers(info, 4, 'compare');
				drawMarkers(info, 5, 'mark');
				//drawMarkers(info, 5, 'play');
			}

			return info;
		};

		_init(settings);
		return bar;
	};

}(this));
/*global d3 */
(function (global) {
	'use strict';

	global.visualization.flat = function (settings) {
		var flat = {},
			// settings
			data = [], $svg, svg,
			flattenedLines = [], numFlattenedLines = 0, frameLength = 0,
			dataColor = 'steelblue', playColor = '#c80000', lines,
			// functions
			_init,
			drawFlattenedLines,
			initFlattenedLines;

		_init = function (settings) {
			data = settings.data;
			svg = settings.svg;
			$svg = settings.$svg;
			// setup lengths
			if (data.length) {
				numFlattenedLines = data[0].arr.length;
				frameLength = data.length;
				initFlattenedLines();
			} else {
				numFlattenedLines = 0;
				frameLength = 0;
				flattenedLines = [];
			}
			$svg.empty();
			svg.attr('viewBox', '0 0 0 0');
			svg.attr('preserveAspectRatio', 'none');
			svg.attr('viewBox', '0 0 ' + (frameLength - 1) + ' ' + numFlattenedLines);
			$svg.empty();
			drawFlattenedLines();
		};

		initFlattenedLines = function () {
			var i, j, id, currentArray, item, index, lastFrameArray, ids = [], half;
			flattenedLines = [];
			if (data.length) {
				lastFrameArray = data[data.length - 1].arr;
				half = Math.floor(numFlattenedLines / 2);
				// build base arrays
				for (i = 0; i < numFlattenedLines; i++) {
					id = lastFrameArray[i].id;
					ids.push(id);
					flattenedLines[i] = {
						id: id,
						dataColor: d3.rgb(dataColor).darker((i - half) / half).toString(),
						playColor: d3.rgb(playColor).darker((i - half) / half).toString(),
						playIndexes: [],
						lineData: []
					};
				}
				// build line data
				for (i = 0; i < frameLength; i++) {
					currentArray = data[i].arr;
					for (j = 0; j < currentArray.length; j++) {
						item = currentArray[j];
						index = ids.indexOf(item.id);
						flattenedLines[index].lineData.push({
							x: i,
							y: j + 0.5
						});
						if (item.play) {
							flattenedLines[index].playIndexes.push(i);
						}
					}
				}
				// darker items should be drawn first
				flattenedLines.reverse();
			}
		};

		drawFlattenedLines = function (index) {
			var line;

			// create our line function
			line = d3.svg.line()
				.interpolate('linear')
				.x(function (d) {
					return d.x;
				})
				.y(function (d) {
					return d.y;
				});

			// select our lines
			lines = svg.selectAll('.line').data(flattenedLines);

			// create
			lines.enter().append('path');

			// update
			lines
				.attr('class', 'line')
				.attr('data-id', function (d) {
					return d.id;
				})
				.attr('stroke', function (d) {
					return d.playIndexes.indexOf(index) >= 0 ? d.playColor : d.dataColor;
				})
				.attr('fill', 'none')
				.attr('stroke-width', 0.5)
				.attr('d', function (d) {
					return line(d.lineData);
				});

			// exit
			lines.exit().remove();
		};

		flat.draw = function (index) {
			lines.attr('stroke', function (d) {
				return d.playIndexes.indexOf(index) >= 0 ? d.playColor : d.dataColor;
			});

			if (data.length > 0) {
				return data[index];
			}
		};


		_init(settings);
		return flat;
	};

}(this));
/*!
 * Project: Audio Sort
 *    File: AS.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
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
		getIndexFromSortObject,
		getSortObjects,
		mark;

	copyObject = function (obj) {
		var isObject = (typeof obj === 'object'),
			rand =  parseInt(Math.random() * 10000000, 10),
			result;
		result = {
			id: isObject ? obj.id : rand + '_' + obj,
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

	getIndexFromSortObject = function (obj) {
		var i;
		for (i = 0; i < _array.length; i++) {
			if (_array[i].id === obj.id) {
				return i;
			}
		}
		return -1;
	};

	getSortObjects = function (inputArray) {
		var i, current, ret = [];
		for (i = 0; i < inputArray.length; i++) {
			current = inputArray[i];
			if (typeof current === 'number') {
				current = AS.get(current);
			}
			ret.push(current);
		}
		return ret;
	};

	compare = function (one, two) {
		var sortObjects = mark('compare', [one, two]);
		compareCount++;
		_frames[_frames.length - 1].compareCount = compareCount;
		return sortObjects;
	};

	mark = function (type, inputArray) {
		var frameIndex, len, i, index, sortObjects = getSortObjects(inputArray);
		frameCheck(type);
		frameIndex = _frames.length - 1;
		len = _frames[frameIndex].arr.length;
		for (i = 0; i < sortObjects.length; i++) {
			index = getIndexFromSortObject(sortObjects[i]);
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
		var sortObjects = compare(one, two);
		return sortObjects[0].value < sortObjects[1].value;
	};

	AS.lte = function (one, two) {
		var sortObjects = compare(one, two);
		return sortObjects[0].value <= sortObjects[1].value;
	};

	AS.gt = function (one, two) {
		var sortObjects = compare(one, two);
		return sortObjects[0].value > sortObjects[1].value;
	};

	AS.gte = function (one, two) {
		var sortObjects = compare(one, two);
		return sortObjects[0].value >= sortObjects[1].value;
	};

	AS.eq = function (one, two) {
		var sortObjects = compare(one, two);
		return sortObjects[0].value === sortObjects[1].value;
	};

	AS.neq = function (one, two) {
		var sortObjects = compare(one, two);
		return sortObjects[0].value !== sortObjects[1].value;
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
		return copyObject(_array[index]);
	};

	AS.swap = function (one, two) {
		var indexOne, indexTwo, tempOne, tempTwo, sortObjects;
		// mark as swapped
		sortObjects = mark('swap', [one, two]);
		indexOne = getIndexFromSortObject(sortObjects[0]);
		indexTwo = getIndexFromSortObject(sortObjects[1]);
		// perform swap
		tempOne = _array[indexOne];
		tempTwo = _array[indexTwo];
		_array[indexOne] = tempTwo;
		_array[indexTwo] = tempOne;
		swapCount++;
		_frames[_frames.length - 1].swapCount = swapCount;
	};

	global.AS = AS;
}(this));
(function (global) {
	'use strict';
	global.A = global.A || {};
}(this));
/*!
 * Project: Audio Sort
 *    File: A.Helper.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
/*global A, $, sc */
(function (global) {
	'use strict';

	var Helper = {},
		// functions
		getMidiNumberHelper;

	getMidiNumberHelper = function (degrees, degreeSize, octaveSize, position) {
		return degrees[position % degreeSize] + (Math.floor(position / degreeSize) * octaveSize);
	};

	Helper.getMidiNumber = function (playValue) {
		var scale, octaveSize, degrees, degreeSize, centerValue, playMidi, centerMidi;

		// get some info from our current scale
		scale = sc.ScaleInfo.at(A.Sort.getSelected('scale'));
		octaveSize = scale.pitchesPerOctave();
		degrees = scale.degrees();
		degreeSize = degrees.length;
		centerValue = Math.floor(A.Sort.getSelected('dataSize') / 2);

		playMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, playValue);
		centerMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, centerValue);

		return playMidi + A.Sort.getSelected('centerNote') - centerMidi;
	};

	Helper.createSlider = function (selector, obj, onChange) {
		var $container = $(selector), $elem = $('<div class="audio-sort-slider"></div>'), $slider;
		$container.empty();
		$elem.appendTo($container);
		$slider = $elem.slider({
			value: obj.value,
			min: obj.min,
			max: obj.max,
			step: obj.step,
			orientation: 'horizontal',
			selection: 'none',
			tooltip: 'hide'
		});
		$slider.on('slide', onChange);
		$slider.on('slideStop', onChange);
		$(selector + ' .slider').width('100%');
		return $slider;
	};

	// add Helper to the global scope
	global.A.Helper = Helper;
}(this));
/*!
 * Project: Audio Sort
 *    File: A.MidiExport.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
/*global $, A */
(function (global) {
	'use strict';

	var MidiExport = {};

	MidiExport.populateChannels = function (selector) {
		var i, $select = $(selector), $option, html = '', numChannels = 16;

		// empty select
		$select.empty();

		// populate select
		for (i = 0; i < numChannels; i++) {
			$option = $('<option></option>')
				.val(i)
				.text(i);
			if (i === 0) {
				$option.attr('selected', 'selected');
			}
			html += $option.wrap('<div />').parent().html();
		}
		$select.append(html);
	};

	MidiExport.populateInstruments = function (selector) {
		var i, instrument, group = '',
			$select = $(selector), $optGroup, $option;

		// empty select
		$select.empty();

		// populate select
		for (i = 0; i < A.instruments.length; i++) {
			instrument = A.instruments[i];
			if (group !== instrument.group) {
				group = instrument.group;
				if ($optGroup) {
					$select.append($optGroup);
				}
				$optGroup = $('<optgroup></optgroup>')
					.attr('label', group);
			}
			$option = $('<option></option>')
				.val(i)
				.text(i + ': ' + instrument.name);
			if (i === 0) {
				$option.attr('selected', 'selected');
			}
			$optGroup.append($option);
		}
		$select.append($optGroup);
	};

	global.A.MidiExport = MidiExport;
}(this));
/*!
 * Project: Audio Sort
 *    File: A.Player.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
/*global $, timbre, d3, A, Midi */
(function (global) {
	'use strict';
	global.A.Player = {};
	global.A.Player.create = function (containerSelector, options) {
		var player = {},
			// Config Values
			canvasBackground = 'rgba(255, 255, 255, 0)',
			// State Variables
			isLooping, isPlaying, isReverse,
			intervalIndex, hasMarkers, allowHover, allowClick, onClick,
			// Cached jQuery items
			$container, $svg, $slider,
			$compareCurrent, $compareMax,
			$swapCurrent, $swapMax,
			$positionCurrent, $positionMax,
			// Cached d3 items
			svg,
			// Data
			data, interval, env, waveGenerator, visualization, selectedVisualization = 'bar',
			// Functions
			_init, clearCanvas, drawSvg, ensureIntervalIndex, intervalCallback,
			refreshSliderPosition,
			// Event Listeners
			onPlayerButtonClick,
			onPlayerButtonClickCallback,
			onSliderPositionChange
			;

		_init = function () {
			options = options || {};

			// setup some more variables
			isLooping = options.isLooping || false;
			isPlaying = options.isPlaying || false;
			isReverse = options.isReverse || false;
			hasMarkers = options.hasMarkers || false;
			allowHover = options.allowHover || false;
			allowClick = options.allowClick || false;
			onClick = options.onClick;
			if (typeof onClick !== 'function') {
				onClick = $.noop;
			}
			intervalIndex = 0;
			$container = $(containerSelector || null);
			$compareCurrent = $container.find('.compare-current');
			$compareMax = $container.find('.compare-max');
			$swapCurrent = $container.find('.swap-current');
			$swapMax = $container.find('.swap-max');
			$positionCurrent = $container.find('.position-current');
			$positionMax = $container.find('.position-max');
			$svg = $container.find('svg');
			svg = d3.select('#' + $svg.attr('id'));
			onPlayerButtonClickCallback = options.onPlayerButtonClickCallback || null;

			// setup audio envelopes/generators and interval
			player.refreshWaveGenerator();
			interval = timbre('interval', { interval: A.Sort.getTempoString() }, intervalCallback);

			// listen for player button clicks
			$container.find('.player-buttons').on('click', '.btn', onPlayerButtonClick);

			// handle hovers
			if (allowHover) {
				$svg.on('mousemove', function (e) {
					if (visualization.onMouseMove) {
						visualization.onMouseMove(e);
					}
				});
				$svg.on('mouseout', function (e) {
					if (visualization.onMouseOut) {
						visualization.onMouseOut(e);
					}
				});
			}

			// handle clicks
			if (allowClick) {
				$svg.on('mousedown', function (e) {
					if (visualization.onMouseDown) {
						visualization.onMouseDown(e);
					}
				});
				$('body').on('mouseup', function (e) {
					if (visualization.onMouseUp) {
						visualization.onMouseUp(e);
					}
				});
			}

		};

		clearCanvas = function (canvas) {
			var context = canvas.getContext('2d');
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		};

		drawSvg = function () {
			var info, len = data.length, last = len - 1;

			// make sure we have a valid index
			ensureIntervalIndex();

			// draw our visualization
			info = visualization.draw(intervalIndex);

			if (info) {
				// compare: current
				if ($compareCurrent.length) {
					$compareCurrent.text(info.compareCount);
				}
				// compare: max
				if ($compareMax.length) {
					$compareMax.text(last > 0 ? data[last].compareCount : 0);
				}
				// swap: current
				if ($swapCurrent.length) {
					$swapCurrent.text(info.swapCount);
				}
				// swap: max
				if ($swapMax.length) {
					$swapMax.text(last > 0 ? data[last].swapCount : 0);
				}
				// position: current
				if ($positionCurrent.length) {
					$positionCurrent.text(intervalIndex + 1);
				}
				// position: max
				if ($positionMax.length) {
					$positionMax.text(len);
				}
			}
		};

		refreshSliderPosition = function () {
			if ($slider.length) {
				$slider.slider('setValue', intervalIndex);
			}
		};

		ensureIntervalIndex = function () {
			// ensure current index is safe
			intervalIndex = Math.min(intervalIndex, data.length - 1);
			intervalIndex = Math.max(intervalIndex, 0);
		};

		intervalCallback = function () {
			var midi, info, i, currentItem, selectedAudioType;
			if (isPlaying) {
				ensureIntervalIndex();
				refreshSliderPosition();

				// play if possible
				if (data.length > 0) {
					info = data[intervalIndex];
					selectedAudioType = A.Sort.getSelected('audioType');
					for (i = 0; i < info.arr.length; i++) {
						currentItem = info.arr[i];
						if (currentItem.play) {
							midi = A.Helper.getMidiNumber(currentItem.value);
							if (midi >= 0 && midi < 128) {
								if (selectedAudioType === 'waveform') {
									waveGenerator.noteOn(midi, 64);
								} else if (selectedAudioType === 'soundfont') {
									timbre.soundfont.play(midi, false, {
										mul: A.Sort.getSelected('volume') * 1.5
									});
								}
							}
						}
					}
					drawSvg();
				}

				// we can advance now
				intervalIndex = isReverse ? intervalIndex - 1 : intervalIndex + 1;

				// we can stop if we are not looping
				if (!isLooping && (intervalIndex < 0 || intervalIndex >= data.length)) {
					player.stop();
				}

				// we need to loop
				if (isLooping && intervalIndex < 0) {
					intervalIndex = data.length - 1;
				} else if (isLooping && intervalIndex >= data.length) {
					intervalIndex = 0;
				}

			} else {
				player.stop();
			}
		};

		onPlayerButtonClick = function () {
			var $item = $(this),
				action = $item.data('action');
			if (action === 'stop') {
				player.stop();
			} else if (action === 'play') {
				player.play();
			} else if (action === 'reverse') {
				player.play(true);
			} else if (action === 'goToFirst') {
				player.goToFirst();
			} else if (action === 'goToLast') {
				player.goToLast();
			} else if (action === 'loop') {
				isLooping = !$item.hasClass('active');
				if (isLooping) {
					$item.addClass('active');
				} else {
					$item.removeClass('active');
				}
			}
			refreshSliderPosition();
			if (typeof onPlayerButtonClickCallback === 'function') {
				onPlayerButtonClickCallback({
					item: $item,
					action: action
				});
			}
		};

		onSliderPositionChange = function (e) {
			intervalIndex = parseInt(e.value, 10);
			ensureIntervalIndex();
			drawSvg();
		};

		player.setData = function (d) {
			var selector = containerSelector + ' .position-container';
			data = d;
			$slider = A.Helper.createSlider(selector, {
				value: 0,
				min: 0,
				max: data.length - 1,
				step: 1
			}, onSliderPositionChange);
			player.setVisualization(selectedVisualization, true);
		};

		player.setVisualization = function (visualizationName, forceInit) {
			var shouldInit = false;
			if (global.visualization.hasOwnProperty(visualizationName) && selectedVisualization !== visualizationName) {
				selectedVisualization = visualizationName;
				shouldInit = true;
			}
			if (shouldInit) {
				$svg.empty();
			}
			if (shouldInit || forceInit) {
				visualization = global.visualization[selectedVisualization]({
					data: data,
					svg: svg,
					$svg: $svg,
					hasMarkers: hasMarkers,
					onClick: onClick
				});
				drawSvg();
			}
		};

		player.setTempo = function (tempo) {
			interval.set({interval: tempo});
		};

		player.setVolume = function (volume) {
			waveGenerator.set({mul: volume});
		};

		player.play = function (reverse) {
			interval.stop();
			isPlaying = true;
			if (reverse === true) {
				isReverse = true;
				if (intervalIndex <= 0) {
					intervalIndex = data.length - 1;
				}
			} else {
				isReverse = false;
				if (intervalIndex >= data.length - 1) {
					intervalIndex = 0;
				}
			}
			isReverse = reverse === true ? true : false;
			if (A.Sort.getSelected('audioType') === 'waveform') {
				waveGenerator.play();
			}
			interval.start();
		};

		player.stop = function () {
			isPlaying = false;
			interval.stop();
		};

		player.isPlaying = function () {
			return isPlaying;
		};

		player.goToFirst = function () {
			intervalIndex = 0;
			ensureIntervalIndex();
			drawSvg();
		};

		player.goToLast = function () {
			intervalIndex = data.length - 1;
			ensureIntervalIndex();
			drawSvg();
		};

		player.getMidiBytes = function (tempo, channel, instrument) {
			var i, j,
				midiFile, midiTrack,
				duration = 64, totalDuration = 0,
				info, currentItem, midiNumber, play;

			// setup midi file
			midiFile = new Midi.File();
			midiTrack = new Midi.Track();
			midiTrack.setTempo(tempo);
			midiTrack.setInstrument(channel, instrument);
			midiFile.addTrack(midiTrack);

			// build midi track
			for (i = 0; i < data.length; i++) {
				info = data[i];
				play = [];
				totalDuration += duration;
				// get the notes we need to play
				for (j = 0; j < info.arr.length; j++) {
					currentItem = info.arr[j];
					if (currentItem.play) {
						midiNumber = A.Helper.getMidiNumber(currentItem.value);
						if (midiNumber >= 0 && midiNumber < 128) {
							play.push(midiNumber);
						}
					}
				}
				// note on
				for (j = 0; j < play.length; j++) {
					if (j === 0) {
						midiTrack.noteOn(channel, play[j], duration);
					} else {
						midiTrack.noteOn(channel, play[j]);
					}
				}
				// note off
				for (j = 0; j < play.length; j++) {
					midiTrack.noteOff(channel, play[j]);
				}
			}

			// extend track so the last note plays
			midiTrack.addEvent(new Midi.MetaEvent({
				type: Midi.MetaEvent.COPYRIGHT,
				data: 'Audio Sort <skratchdot.com>',
				time: totalDuration + 1024
			}));

			return midiFile.toBytes();
		};

		player.refreshWaveGenerator = function () {
			var waveInfo = A.Sort.getSelectedWaveformInfo();
			$.each([env, waveGenerator], function (index, obj) {
				$.each(['pause', 'removeAllListeners'], function (index, key) {
					if (obj && typeof obj[key] === 'function') {
						obj[key]();
					}
				});
			});
			env = timbre('adshr', {
				a: waveInfo.a,
				d: waveInfo.d,
				s: waveInfo.s,
				h: waveInfo.h,
				r: waveInfo.r
			});
			waveGenerator = timbre(waveInfo.gen, {
				env: env,
				mul: A.Sort.getSelected('volume') * waveInfo.mul,
				poly: waveInfo.poly || 10
			}).on('ended', function () {
				if (!isPlaying) {
					this.pause();
				}
			});
			if (waveInfo.gen === 'OscGen') {
				waveGenerator.set('osc', timbre(A.Sort.getSelected('waveform')));
			}
			if (isPlaying && A.Sort.getSelected('audioType') === 'waveform') {
				waveGenerator.play();
			}
		};

		player.drawEnvelopeCanvas = function () {
			var canvas = $('#waveform-adshr-canvas').get(0);
			// ADSHR
			clearCanvas(canvas);
			if (env && typeof env.plot === 'function') {
				env.plot({
					target: canvas,
					background: canvasBackground
				});
			}
		};

		player.drawWaveformCanvases = function () {
			var canvas = $('#waveform-canvas').get(0);
			// ADSHR
			player.drawEnvelopeCanvas();
			// Waveform
			clearCanvas(canvas);
			if (waveGenerator && waveGenerator.osc) {
				waveGenerator.osc.plot({
					target: canvas,
					background: canvasBackground
				});
			}
		};

		// initialize player
		_init();

		return player;
	};
}(this));
/*!
 * Project: Audio Sort
 *    File: A.Sort.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
/*global $, sc, ace, d3, js_beautify, timbre, A, Worker, Blob, Uint8Array, saveAs */
(function (global) {
	'use strict';

	var Sort = {},
		// Pass jshint
		Fn = Function,
		// Default Settings
		defaults = {
			volume: { value: 0.25, min: 0, max: 1, step: 0.01 },
			tempo: { value: 90, min: 20, max: 300, step: 1 },
			centerNote: { value: 69, min: 0, max: 127, step: 1 },
			scale: { value: 'chromatic' },
			sort: { value: 'bubble' },
			dataSize: { value: 12, min: 4, max: 48, step: 1 },
			audioType: { value: 'waveform' },
			waveform: { value: 'string' },
			soundfont: { value: 0 }
		},
		// Currently Selected Items
		selected = {
			volume: defaults.volume.value,
			tempo: defaults.tempo.value,
			centerNote: defaults.centerNote.value,
			scale: defaults.scale.value,
			sort: defaults.sort.value,
			dataSize: defaults.dataSize.value,
			audioType: defaults.audioType.value,
			waveform: defaults.waveform.value,
			soundfont: defaults.soundfont.value
		},
		// Waveform Data
		waveform = {
			'string': { gen: 'PluckGen', poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 500, r: 2500 },
			'sin':    { gen: 'OscGen', poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
			'cos':    { gen: 'OscGen', poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
			'pulse':  { gen: 'OscGen', poly: 10, mul: 0.25, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
			'tri':    { gen: 'OscGen', poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
			'saw':    { gen: 'OscGen', poly: 10, mul: 0.25, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
			'fami':   { gen: 'OscGen', poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
			'konami': { gen: 'OscGen', poly: 10, mul: 0.4, a: 50, d: 300, s: 0.5, h: 200, r: 300 }
		},
		waveformSliders = {},
		// Audio players
		players = {
			base: null,
			sort: null
		},
		// Audio Variables
		env,
		pluck,
		// Ace Editor
		aceEditor,
		// AutoPlay
		$sortAutoPlay,
		triggerAutoPlay = false,
		// Helper Variables
		displayCache = {},
		baseData = [],
		maxData = [],
		// Prevent clicks from spawing too many web workers
		clickTimer = null,
		clickDelay = 250,
		// Web Workers
		worker = null,
		workerKey,
		workerUrl = 'dist/worker.min.js',
		workerOnMessage,
		workerOnError,
		// Functions
		addAceEditor,
		populateWaveformButtons,
		updateWaveformDisplays,
		setSliderWaveformFromSelected,
		onAudioTypeButtonClick,
		onAudioTypeTabLinkClick,
		onSaveAlgorithmEdit,
		onSaveAlgorithmNew,
		onOptionBoxFilter,
		buildSortOptions,
		clickPlayButton,
		doSort,
		generateData,
		getScale,
		getBaseDataAsFrames,
		getBaseDataAsPlayableObjects,
		getNoteName,
		getSortedScaleNames,
		onAudioDataButton,
		onSlider,
		onSliderCenterNote,
		onSliderDataSize,
		onSliderTempo,
		onSliderVolume,
		onSliderWaveform,
		onWaveformButtonClick,
		onSortOptionSelected,
		onMidiExportClick,
		onMidiSave,
		onSortModalClick,
		onSortVisualizationButton,
		onAddAlgorithmModalClick,
		playerButtonCallback,
		populateScaleOptions,
		populateSoundfontOptions,
		preloadSoundfonts,
		setupPlayers,
		updateDisplayCache;

	buildSortOptions = function (selector) {
		var $container, $li, $a, sortKey, sortObject;
		if (global.hasOwnProperty('sort')) {
			$container = $(selector);
			$container.empty();
			for (sortKey in global.sort) {
				if (global.sort.hasOwnProperty(sortKey)) {
					sortObject = global.sort[sortKey];
					$li = $('<li></li>');
					$a = $('<a href="javascript:void(0);"></a>');
					$a.attr('data-sort', sortKey);
					$a.text(sortObject.display);
					$li.append($a);
					$container.append($li);
				}
			}
		}
	};
	
	populateWaveformButtons = function () {
		var html = '';
		$.each(waveform, function (waveformName) {
			html += $('<button />')
				.addClass('btn btn-mini' + (waveformName === selected.waveform ? ' active' : ''))
				.attr('type', 'button')
				.attr('data-waveform', waveformName)
				.text(waveformName)
				.wrap('<div />').parent().html();
		});
		$('#waveform .btn-group').html(html);
	};

	onWaveformButtonClick = function () {
		var $this = $(this);
		selected.waveform = $this.attr('data-waveform');
		// update slider values
		setSliderWaveformFromSelected();
		// update text on audio tab
		updateDisplayCache('#audio-type-display', 'waveform: ' + selected.waveform);
		// start using new selection
		players.base.refreshWaveGenerator();
		players.sort.refreshWaveGenerator();
		players.base.drawWaveformCanvases();
	};

	getBaseDataAsPlayableObjects = function (playIndex) {
		var i, objectArray = [];
		// convert baseData to an array of drawable/playable objects
		for (i = 0; i < baseData.length; i++) {
			objectArray.push({
				value: baseData[i],
				play: i === playIndex,
				mark: false,
				swap: false,
				justSwapped: false,
				compare: false,
				highlight: false
			});
		}
		return objectArray;
	};

	getBaseDataAsFrames = function () {
		var i, frameArray = [];

		// convert to "frame data"
		for (i = 0; i < baseData.length; i++) {
			frameArray.push({
				arr: getBaseDataAsPlayableObjects(i),
				compareCount: 0,
				swapCount: 0
			});
		}
		return frameArray;
	};

	clickPlayButton = function () {
		$('#sort-player .btn[data-action="play"]').click();
	};

	getNoteName = function (midiNumber) {
		var notes = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'],
			len = notes.length,
			octave = Math.floor(midiNumber / len) - 1,
			idx = midiNumber % len,
			note = notes[idx];
		return '(' + note.charAt(0) + octave + note.charAt(1) + ') ' + midiNumber;
	};

	updateDisplayCache = function (selector, value, fnFormat) {
		if (!displayCache.hasOwnProperty(selector)) {
			displayCache[selector] = $(selector);
		}
		if (typeof fnFormat === 'function') {
			value = fnFormat(value);
		}
		displayCache[selector].text(value);
	};

	onAudioTypeButtonClick = function () {
		var $this = $(this),
			$tabs = $('#settings li[data-audio-type]'),
			$tabLink = $('#audio-type-tab-link'),
			audioType = $this.attr('data-audio-type'),
			audioTypeName = $this.text(),
			displayName;
		// set selected type
		selected.audioType = audioType;
		displayName = audioType;
		if (selected.audioType === 'waveform') {
			displayName += ': ' + selected.waveform;
			players.base.refreshWaveGenerator();
			players.sort.refreshWaveGenerator();
		} else if (selected.audioType === 'soundfont') {
			displayName = $('#soundfont-options li.active').text();
		}
		updateDisplayCache('#audio-type-display', displayName);
		// update settings link
		$tabLink.text(audioTypeName.toLowerCase() + ' settings');
		// show correct tab
		$tabs.removeClass('hidden');
		$tabs.filter('[data-audio-type!="' + audioType + '"]').addClass('hidden');
		preloadSoundfonts();
	};

	onAudioTypeTabLinkClick = function () {
		$('#settings li[data-audio-type]:visible a').click();
	};

	onSlider = function (key, selector, event, fnFormat) {
		if (event) {
			selected[key] = event.value;
		}
		updateDisplayCache(selector, selected[key], fnFormat);
	};

	onSliderVolume = function (e) {
		var volume;
		onSlider('volume', '#volume-display', e, function (val) {
			return val.toFixed(2);
		});
		volume = waveform[selected.waveform].mul * selected.volume;
		players.base.setVolume(volume);
		players.sort.setVolume(volume);
	};

	onSliderTempo = function (e) {
		var tempo = Sort.getTempoString();
		onSlider('tempo', '#tempo-display', e);
		players.base.setTempo(tempo);
		players.sort.setTempo(tempo);
	};

	onSliderCenterNote = function (e) {
		onSlider('centerNote', '#center-note-display', e, getNoteName);
		preloadSoundfonts();
	};

	onSliderDataSize = function (e) {
		onSlider('dataSize', '#data-size-display', e);
		generateData(false);
		doSort();
	};

	onSliderWaveform = function (e) {
		var $slider = $(e.target),
			$container = $slider.parents('[data-adshr]:first'),
			adshr = $container.attr('data-adshr');
		waveform[selected.waveform][adshr] = (adshr === 's') ? parseFloat(e.value.toFixed(2)) : e.value;
		updateWaveformDisplays();
		players.base.refreshWaveGenerator();
		players.sort.refreshWaveGenerator();
		players.base.drawEnvelopeCanvas();
	};

	onAudioDataButton = function () {
		var action = $(this).data('action');
		if (global.fn.datagen.hasOwnProperty(action)) {
			generateData(true, action);
			doSort();
		}
	};

	onSortOptionSelected = function () {
		var $item = $(this),
			$parent = $item.parent();
		if ($item.hasClass('disabled')) {
			return;
		}
		$parent.find('li').removeClass('active');
		$item.addClass('active');
		updateDisplayCache('#sort-display', $item.text());
		selected.sort = $item.find('a').data('sort');
		if ($sortAutoPlay.hasClass('active')) {
			triggerAutoPlay = true;
		}
		doSort();
	};

	updateWaveformDisplays = function () {
		updateDisplayCache('#waveform-adshr-attack-display', waveform[selected.waveform].a);
		updateDisplayCache('#waveform-adshr-decay-display', waveform[selected.waveform].d);
		updateDisplayCache('#waveform-adshr-sustain-display', waveform[selected.waveform].s);
		updateDisplayCache('#waveform-adshr-hold-display', waveform[selected.waveform].h);
		updateDisplayCache('#waveform-adshr-release-display', waveform[selected.waveform].r);
	};

	setSliderWaveformFromSelected = function () {
		$.each(['a', 'd', 's', 'h', 'r'], function (index, key) {
			waveformSliders[key].slider('setValue', waveform[selected.waveform][key]);
		});
		updateWaveformDisplays();
	};

	getScale = function (domainMin, domainMax, rangeMin, rangeMax) {
		return d3.scale.linear()
			.domain([domainMin, domainMax])
			.range([rangeMin, rangeMax]);
	};

	generateData = function (regenerateMaxData, action) {
		var i, scale, slice;
		if (regenerateMaxData) {
			if (global.fn.datagen.hasOwnProperty(action)) {
				baseData = global.fn.datagen[action](selected.dataSize);
				maxData = global.fn.datagen[action](defaults.dataSize.max);
				slice = maxData.slice(0, selected.dataSize);
				scale = getScale(
					0,
					baseData.length - 1,
					d3.min(slice),
					d3.max(slice));
				// we always want our current "baseData" when re-sizing
				for (i = 0; i < baseData.length; i++) {
					maxData[i] =  Math.round(scale(baseData[i]));
				}
			}
		} else {
			baseData = maxData.slice(0, selected.dataSize);
			scale = getScale(d3.min(baseData), d3.max(baseData), 0, baseData.length - 1);
			// normalize data
			for (i = 0; i < baseData.length; i++) {
				baseData[i] = Math.round(scale(maxData[i]));
			}
		}
		players.base.setData(getBaseDataAsFrames());
		preloadSoundfonts();
	};

	addAceEditor = function (container) {
		var $container = $(container),
			id = 'id_' + (new Date()).getTime();
		$container.empty().append('<div class="js-editor" id="' + id + '"></div>');
		aceEditor = ace.edit(id);
		aceEditor.setTheme('ace/theme/monokai');
		aceEditor.getSession().setMode('ace/mode/javascript');
		aceEditor.getSession().on('changeAnnotation', function () {
			var i,
				annotation,
				annotationsOld = aceEditor.getSession().getAnnotations(),
				annotationsNew = [],
				changed = false;
			for (i = 0; i < annotationsOld.length; i++) {
				annotation = annotationsOld[i];
				if (annotation.text === "'AS' is not defined.") {
					changed = true;
				} else {
					annotationsNew.push(annotation);
				}
			}
			if (changed) {
				aceEditor.getSession().setAnnotations(annotationsNew);
			}
		});
	};

	onMidiExportClick = function () {
		var $modal = $('#modal-midi-export');

		// setup a default file name
		$('#midi-export-name').attr('placeholder', 'AudioSort_' + (new Date()).getTime()).val('');

		// populate channels
		A.MidiExport.populateChannels('#midi-export-channel');

		// populate instruments
		A.MidiExport.populateInstruments('#midi-export-instrument');

		// store the source of our data so onMidiSave() can use it
		$('#midi-export-btn').attr('data-midi-export', $(this).data('midiExport'));

		// open the modal
		$modal.modal();
	};

	onMidiSave = function () {
		var byteNumbers, blob,
			playerType = $('#midi-export-btn').attr('data-midi-export'),
			$filename = $('#midi-export-name'),
			filename = $.trim($filename.val());

		// use placeholder if a filename wasn't entered
		if (filename === '') {
			filename = $filename.attr('placeholder');
		}
		filename += '.mid';

		// save file
		if (players.hasOwnProperty(playerType)) {
			byteNumbers = $.map(players[playerType]
				.getMidiBytes(selected.tempo,
						$('#midi-export-channel').val(),
						$('#midi-export-instrument').val()).split(''), function (item) {
				return item.charCodeAt(0);
			});
			blob = new Blob([new Uint8Array(byteNumbers)], {
				type: 'audio/midi'
			});
			saveAs(blob, filename);
		}
	};

	onSortModalClick = function () {
		var $modal = $('#modal-sort'),
			selectedSort = global.sort[selected.sort],
			fnArray,
			fnText;
		$modal.find('.sort-name').text(selectedSort.display);
		$modal.find('.nav-tabs a:first').tab('show');
		$modal.find('#sort-info-display').html(selectedSort.display || '&nbsp;');
		$modal.find('#sort-info-stable').html(selectedSort.stable ? 'Yes' : 'No');
		$modal.find('#sort-info-best').html(selectedSort.best || '&nbsp;');
		$modal.find('#sort-info-average').html(selectedSort.average || '&nbsp;');
		$modal.find('#sort-info-worst').html(selectedSort.worst || '&nbsp;');
		$modal.find('#sort-info-memory').html(selectedSort.memory || '&nbsp;');
		$modal.find('#sort-info-method').html(selectedSort.method || '&nbsp;');
		addAceEditor('#sort-algorithm');
		fnArray = $.trim(selectedSort.toString()).split('\n');
		fnText = fnArray.splice(1, fnArray.length - 2).join('\n');
		fnText = js_beautify(fnText, {
			indent_size: 1,
			indent_char: '\t'
		});
		aceEditor.setValue(fnText);
		aceEditor.clearSelection();
		$modal.modal();
	};

	onSortVisualizationButton = function () {
		var $this = $(this),
			type = $this.data('visualization');
		players.sort.setVisualization(type);
	};

	onSaveAlgorithmEdit = function () {
		global.sort[selected.sort] = new Fn(aceEditor.getValue());
		$('#modal-sort').modal('hide');
	};

	onSaveAlgorithmNew = function () {
		var name = $('#new-sort-name').val(),
			nameSafe = name.replace(/[^a-zA-Z]/gi, ''),
			id = nameSafe + '_id_' + (new Date()).getTime();
		if ($.trim(name).length) {
			global.sort[id] = new Fn(aceEditor.getValue());
			global.sort[id].display = name;
			global.sort[id].stable = true;
			global.sort[id].best = '';
			global.sort[id].average = '';
			global.sort[id].worst = '';
			global.sort[id].memory = '';
			global.sort[id].method = '';
		}
		$('#modal-add-algorithm').modal('hide');
		buildSortOptions('#sort-options');
	};

	onAddAlgorithmModalClick = function () {
		var $modal = $('#modal-add-algorithm');
		$modal.find('#new-sort-name').val('');
		addAceEditor('#new-sort-algorithm');
		$modal.modal();
	};

	playerButtonCallback = function (player, action) {
		if (action === 'play' || action === 'reverse' || action === 'stop') {
			player.stop();
		}
	};

	setupPlayers = function () {
		players.base = A.Player.create('#base-section', {
			env: env,
			pluck: pluck,
			isLooping: true,
			hasMarkers: false,
			allowHover: true,
			allowClick: true,
			onClick: function (index, value) {
				baseData[index] = value;
				maxData[index] = getScale(0, baseData.length - 1, 0, maxData.length - 1)(value);
				players.base.setData(getBaseDataAsFrames());
				clearTimeout(clickTimer);
				clickTimer = setTimeout(doSort, clickDelay);
			},
			onPlayerButtonClickCallback: function (e) {
				playerButtonCallback(players.sort, e.action);
			}
		});
		players.sort = A.Player.create('#sort-section', {
			env: env,
			pluck: pluck,
			isLooping: true,
			hasMarkers: true,
			onPlayerButtonClickCallback: function (e) {
				playerButtonCallback(players.base, e.action);
			}
		});
	};

	getSortedScaleNames = function () {
		var names = sc.ScaleInfo.names().sort(function (o1, o2) {
			var ret = 0,
				s1 = sc.ScaleInfo.at(o1),
				s2 = sc.ScaleInfo.at(o2);
			ret = s1.pitchesPerOctave() - s2.pitchesPerOctave();
			if (ret === 0) {
				ret = s1.degrees().length - s2.degrees().length;
				if (ret === 0) {
					ret = s1.name.localeCompare(s2.name);
				}
			}
			return ret;
		});
		return names;
	};

	populateScaleOptions = function (selector) {
		var currentKey, lastKey, scale, scaleNames,
			numPitches, numDegrees,
			$ul = $(selector), $li, htmlString = '';

		scaleNames = getSortedScaleNames();
		$.each(scaleNames, function (index, scaleName) {
			// loop variables
			scale = sc.ScaleInfo.at(scaleName);
			numPitches = scale.pitchesPerOctave();
			numDegrees = scale.degrees().length;
			currentKey = numPitches + '_' + numDegrees;
			if (currentKey !== lastKey) {
				lastKey = currentKey;
				$li = $('<li />').addClass('disabled').wrapInner(
					$('<a href="javascript:void(0);"></a>').text(
						'Octave: ' + numPitches + ' / Notes: ' + numDegrees
					)
				);
				htmlString += $li.wrap('<div />').parent().html();
			}
			$li = $('<li />').attr('data-scale', scaleName).wrapInner(
				$('<a href="javascript:void(0);"></a>').text(scale.name)
			);
			htmlString += $li.wrap('<div />').parent().html();
		});
		$ul.append(htmlString);
		$ul.on('click', 'li', function () {
			var $this = $(this);
			if (!$this.hasClass('disabled')) {
				$ul.find('li').removeClass('active');
				$this.addClass('active');
				selected.scale = $this.data('scale');
				updateDisplayCache('#scale-display', $this.text());
				preloadSoundfonts();
			}
		});
	};

	populateSoundfontOptions = function (selector) {
		var i, instrument, group = '',
			$ul = $(selector), $li, htmlString = '';
		for (i = 0; i < A.instruments.length; i++) {
			instrument = A.instruments[i];
			// output group
			if (group !== instrument.group) {
				group = instrument.group;
				$li = $('<li />').addClass('disabled').wrapInner(
					$('<a href="javascript:void(0);"></a>').text(
						instrument.group
					)
				);
				htmlString += $li.wrap('<div />').parent().html();
			}
			// output instrument
			$li = $('<li />').attr('data-soundfont', instrument.val).wrapInner(
				$('<a href="javascript:void(0);"></a>').text(i + ': ' + instrument.name)
			);
			if (selected.soundfont === i) {
				$li.addClass('active');
			}
			htmlString += $li.wrap('<div />').parent().html();
		}
		$ul.append(htmlString);
		$ul.on('click', 'li', function () {
			var $this = $(this);
			if (!$this.hasClass('disabled')) {
				$ul.find('li').removeClass('active');
				$this.addClass('active');
				selected.soundfont = $this.data('soundfont');
				timbre.soundfont.setInstrument(selected.soundfont);
				updateDisplayCache('#soundfont-display', $this.text());
				updateDisplayCache('#audio-type-display', $this.text());
				preloadSoundfonts();
			}
		});
	};

	preloadSoundfonts = function () {
		var i, midiNotes = [], midi;
		if (selected.audioType === 'soundfontX') {
			for (i = 0; i < baseData.length; i++) {
				midi = A.Helper.getMidiNumber(baseData[i]);
				if (midiNotes.indexOf(midi) === -1 && midi >= 0 && midi < 128) {
					midiNotes.push(midi);
				}
			}
			timbre.soundfont.preload(midiNotes);
		}
	};

	onOptionBoxFilter = function () {
		var show = false,
			$this = $(this),
			listId = $this.attr('data-list-id'),
			$listItems = $('#' + listId + ' li'),
			val = $.trim($this.val()),
			regex = new RegExp(val, 'i');
		if (val === '') {
			$listItems.show();
		} else {
			$.each($listItems.get().reverse(), function (index, item) {
				var $item = $(item);
				if ($item.hasClass('disabled')) {
					$item.css('display', show ? 'block' : 'none');
					show = false;
				} else {
					if (regex.test($item.text())) {
						$item.show();
						show = true;
					} else {
						$item.hide();
					}
				}
			});
		}
	};

	workerOnMessage = function (event) {
		var isSortPlaying = players.sort.isPlaying();
		if (event.data.key === workerKey) {
			players.sort.setData(event.data.frames || []);
			players.sort.goToFirst();
			if (isSortPlaying || triggerAutoPlay) {
				clickPlayButton();
			}
		}
		triggerAutoPlay = false;
	};

	workerOnError = function (event) {
		console.log(event);
	};

	doSort = function () {
		workerKey = (new Date()).getTime();

		// browsers that don't support Web Workers will behave slowly
		if (typeof Worker === 'undefined') {
			AS.init(baseData, workerKey);
			global.sort[selected.sort]();
			workerOnMessage({
				data: {
					key: workerKey,
					frames: AS.end(workerKey)
				}
			});
			return;
		}

		// we should terminate our previous worker
		if (worker !== null) {
			worker.removeEventListener('message', workerOnMessage, false);
			worker.removeEventListener('error', workerOnError, false);
			worker.terminate();
		}

		// perform sort in worker thread
		worker = new Worker(workerUrl);
		worker.addEventListener('message', workerOnMessage, false);
		worker.addEventListener('error', workerOnError, false);
		worker.postMessage({
			key : workerKey,
			fn : global.sort[selected.sort].toString(),
			arr : baseData
		});
	};

	Sort.getSelected = function (key, defaultValue) {
		return selected.hasOwnProperty(key) ? selected[key] : defaultValue;
	};

	Sort.getSelectedWaveformInfo = function () {
		return waveform[selected.waveform];
	};

	Sort.getTempoString = function () {
		return 'bpm' + (parseFloat(selected.tempo) || defaults.tempo) + ' l16';
	};

	Sort.init = function (webWorkerUrl) {
		if (typeof webWorkerUrl === 'string') {
			workerUrl = webWorkerUrl;
		}
		// when using a mobile device, decrease samplerate.
		// idea taken from: http://mohayonao.github.io/timbre.js/misc/js/common.js
		if (timbre.envmobile) {
			timbre.setup({samplerate:timbre.samplerate * 0.5});
		}
		// build our sort options
		buildSortOptions('#sort-options');
		// build waveform buttons
		populateWaveformButtons();
		// setup audio and audio players
		setupPlayers();
		// setup base data
		generateData(true, 'randomUnique');
		// populate our scale dropdown
		populateScaleOptions('#scale-options');
		updateDisplayCache(
			'#scale-display',
			$('#scale-options li[data-scale="' + selected.scale + '"]').text()
		);
		$('#scale-filter')
			.on('keyup', onOptionBoxFilter)
			.on('focus', function () {
				$(this).val('');
				$('#scale-options li').show();
			});
		// populate our soundfont dropdown
		populateSoundfontOptions('#soundfont-options');
		updateDisplayCache(
			'#soundfont-display',
			$('#soundfont-options li[data-soundfont="' + selected.soundfont + '"]').text()
		);
		$('#soundfont-filter')
			.on('keyup', onOptionBoxFilter)
			.on('focus', function () {
				$(this).val('');
				$('#soundfont-options li').show();
			});
		// create some of our sliders
		A.Helper.createSlider('#volume-container', defaults.volume, onSliderVolume);
		A.Helper.createSlider('#tempo-container', defaults.tempo, onSliderTempo);
		A.Helper.createSlider('#center-note-container', defaults.centerNote, onSliderCenterNote);
		A.Helper.createSlider('#data-size-container', defaults.dataSize, onSliderDataSize);
		// create our waveform sliders
		waveformSliders.a = A.Helper.createSlider('#waveform-adshr-attack-container', {
			value: waveform[selected.waveform].a, min: 10, max: 500, step: 5
		}, onSliderWaveform);
		waveformSliders.d = A.Helper.createSlider('#waveform-adshr-decay-container', {
			value: waveform[selected.waveform].d, min: 10, max: 2000, step: 5
		}, onSliderWaveform);
		waveformSliders.s = A.Helper.createSlider('#waveform-adshr-sustain-container', {
			value: waveform[selected.waveform].s, min: 0, max: 1, step: 0.01
		}, onSliderWaveform);
		waveformSliders.h = A.Helper.createSlider('#waveform-adshr-hold-container', {
			value: waveform[selected.waveform].h, min: 10, max: 3000, step: 5
		}, onSliderWaveform);
		waveformSliders.r = A.Helper.createSlider('#waveform-adshr-release-container', {
			value: waveform[selected.waveform].r, min: 10, max: 3000, step: 5
		}, onSliderWaveform);
		// cache a few items
		$sortAutoPlay = $('#sort-autoplay');
		// handle button clicks
		$('#audio-type-container .btn').on('click', onAudioTypeButtonClick);
		$('#audio-type-tab-link').on('click', onAudioTypeTabLinkClick);
		$('#audio-type-container .btn[data-audio-type="' + selected.audioType + '"]').click();
		$('#waveform .btn-group .btn').on('click', onWaveformButtonClick);
		$('span[data-midi-export]').on('click', onMidiExportClick);
		$('#midi-export-btn').on('click', onMidiSave);
		$('#modal-sort-open').on('click', onSortModalClick);
		$('#add-algorithm-btn').on('click', onAddAlgorithmModalClick);
		$('#save-algorithm-edit').on('click', onSaveAlgorithmEdit);
		$('#save-algorithm-new').on('click', onSaveAlgorithmNew);
		$('#base-buttons').on('click', '.btn', onAudioDataButton);
		$('#sort-options').on('click', 'li', onSortOptionSelected);
		$('.sort-visualization').on('click', onSortVisualizationButton);
		$('#sort-options [data-sort=' + selected.sort + ']').click();
		// draw envelope canvas
		players.base.drawWaveformCanvases();
		// update slider selction text
		updateDisplayCache('#volume-display', selected.volume);
		updateDisplayCache('#tempo-display', selected.tempo);
		updateDisplayCache('#center-note-display', selected.centerNote, getNoteName);
		updateDisplayCache('#data-size-display', selected.dataSize);
	};

	global.A.Sort = Sort;
}(this));
/*!
 * Project: Audio Sort
 *    File: A.instruments.js
 *  Source: https://github.com/skratchdot/audio-sort/
 *
 * Copyright (c) 2013 skratchdot
 * Licensed under the MIT license.
 */
(function (global) {
	'use strict';

	global.A.instruments = [
	  { "val": 0, "name": "Acoustic Grand Piano", "group": "Piano"}
	, { "val": 1, "name": "Bright Acoustic Piano", "group": "Piano"}
	, { "val": 2, "name": "Electric Grand Piano", "group": "Piano"}
	, { "val": 3, "name": "Honky-tonk Piano", "group": "Piano"}
	, { "val": 4, "name": "Electric Piano 1", "group": "Piano"}
	, { "val": 5, "name": "Electric Piano 2", "group": "Piano"}
	, { "val": 6, "name": "Harpsichord", "group": "Piano"}
	, { "val": 7, "name": "Clavinet", "group": "Piano"}
	
	, { "val": 8, "name": "Celesta", "group": "Chromatic Percussion"}
	, { "val": 9, "name": "Glockenspiel", "group": "Chromatic Percussion"}
	, { "val": 10, "name": "Music Box", "group": "Chromatic Percussion"}
	, { "val": 11, "name": "Vibraphone", "group": "Chromatic Percussion"}
	, { "val": 12, "name": "Marimba", "group": "Chromatic Percussion"}
	, { "val": 13, "name": "Xylophone", "group": "Chromatic Percussion"}
	, { "val": 14, "name": "Tubular Bells", "group": "Chromatic Percussion"}
	, { "val": 15, "name": "Dulcimer", "group": "Chromatic Percussion"}
	
	, { "val": 16, "name": "Drawbar Organ", "group": "Organ"}
	, { "val": 17, "name": "Percussive Organ", "group": "Organ"}
	, { "val": 18, "name": "Rock Organ", "group": "Organ"}
	, { "val": 19, "name": "Church Organ", "group": "Organ"}
	, { "val": 20, "name": "Reed Organ", "group": "Organ"}
	, { "val": 21, "name": "Accordion", "group": "Organ"}
	, { "val": 22, "name": "Harmonica", "group": "Organ"}
	, { "val": 23, "name": "Tango Accordion", "group": "Organ"}
	
	, { "val": 24, "name": "Acoustic Guitar (nylon)", "group": "Guitar"}
	, { "val": 25, "name": "Acoustic Guitar (steel)", "group": "Guitar"}
	, { "val": 26, "name": "Electric Guitar (jazz)", "group": "Guitar"}
	, { "val": 27, "name": "Electric Guitar (clean)", "group": "Guitar"}
	, { "val": 28, "name": "Electric Guitar (muted)", "group": "Guitar"}
	, { "val": 29, "name": "Overdriven Guitar", "group": "Guitar"}
	, { "val": 30, "name": "Distortion Guitar", "group": "Guitar"}
	, { "val": 31, "name": "Guitar Harmonics", "group": "Guitar"}
	
	, { "val": 32, "name": "Acoustic Bass", "group": "Bass"}
	, { "val": 33, "name": "Electric Bass (finger)", "group": "Bass"}
	, { "val": 34, "name": "Electric Bass (pick)", "group": "Bass"}
	, { "val": 35, "name": "Fretless Bass", "group": "Bass"}
	, { "val": 36, "name": "Slap Bass 1", "group": "Bass"}
	, { "val": 37, "name": "Slap Bass 2", "group": "Bass"}
	, { "val": 38, "name": "Synth Bass 1", "group": "Bass"}
	, { "val": 39, "name": "Synth Bass 2", "group": "Bass"}
	
	, { "val": 40, "name": "Violin", "group": "Strings"}
	, { "val": 41, "name": "Viola", "group": "Strings"}
	, { "val": 42, "name": "Cello", "group": "Strings"}
	, { "val": 43, "name": "Contrabass", "group": "Strings"}
	, { "val": 44, "name": "Tremolo Strings", "group": "Strings"}
	, { "val": 45, "name": "Pizzicato Strings", "group": "Strings"}
	, { "val": 46, "name": "Orchestral Harp", "group": "Strings"}
	, { "val": 47, "name": "Timpani", "group": "Strings"}
	
	, { "val": 48, "name": "String Ensemble 1", "group": "Ensemble"}
	, { "val": 49, "name": "String Ensemble 2", "group": "Ensemble"}
	, { "val": 50, "name": "Synth Strings 1", "group": "Ensemble"}
	, { "val": 51, "name": "Synth Strings 2", "group": "Ensemble"}
	, { "val": 52, "name": "Choir Aahs", "group": "Ensemble"}
	, { "val": 53, "name": "Voice Oohs", "group": "Ensemble"}
	, { "val": 54, "name": "Synth Choir", "group": "Ensemble"}
	, { "val": 55, "name": "Orchestra Hit", "group": "Ensemble"}
	
	, { "val": 56, "name": "Trumpet", "group": "Brass"}
	, { "val": 57, "name": "Trombone", "group": "Brass"}
	, { "val": 58, "name": "Tuba", "group": "Brass"}
	, { "val": 59, "name": "Muted Trumpet", "group": "Brass"}
	, { "val": 60, "name": "French Horn", "group": "Brass"}
	, { "val": 61, "name": "Brass Section", "group": "Brass"}
	, { "val": 62, "name": "Synth Brass 1", "group": "Brass"}
	, { "val": 63, "name": "Synth Brass 2", "group": "Brass"}
	
	, { "val": 64, "name": "Soprano Sax", "group": "Reed"}
	, { "val": 65, "name": "Alto Sax", "group": "Reed"}
	, { "val": 66, "name": "Tenor Sax", "group": "Reed"}
	, { "val": 67, "name": "Baritone Sax", "group": "Reed"}
	, { "val": 68, "name": "Oboe", "group": "Reed"}
	, { "val": 69, "name": "English Horn", "group": "Reed"}
	, { "val": 70, "name": "Bassoon", "group": "Reed"}
	, { "val": 71, "name": "Clarinet", "group": "Reed"}
	
	, { "val": 72, "name": "Piccolo", "group": "Pipe"}
	, { "val": 73, "name": "Flute", "group": "Pipe"}
	, { "val": 74, "name": "Recorder", "group": "Pipe"}
	, { "val": 75, "name": "Pan Flute", "group": "Pipe"}
	, { "val": 76, "name": "Blown bottle", "group": "Pipe"}
	, { "val": 77, "name": "Shakuhachi", "group": "Pipe"}
	, { "val": 78, "name": "Whistle", "group": "Pipe"}
	, { "val": 79, "name": "Ocarina", "group": "Pipe"}
	
	, { "val": 80, "name": "Lead 1 (square)", "group": "Synth Lead"}
	, { "val": 81, "name": "Lead 2 (sawtooth)", "group": "Synth Lead"}
	, { "val": 82, "name": "Lead 3 (calliope)", "group": "Synth Lead"}
	, { "val": 83, "name": "Lead 4 (chiff)", "group": "Synth Lead"}
	, { "val": 84, "name": "Lead 5 (charang)", "group": "Synth Lead"}
	, { "val": 85, "name": "Lead 6 (voice)", "group": "Synth Lead"}
	, { "val": 86, "name": "Lead 7 (fifths)", "group": "Synth Lead"}
	, { "val": 87, "name": "Lead 8 (bass + lead)", "group": "Synth Lead"}
	
	, { "val": 88, "name": "Pad 1 (new age)", "group": "Synth Pad"}
	, { "val": 89, "name": "Pad 2 (warm)", "group": "Synth Pad"}
	, { "val": 90, "name": "Pad 3 (polysynth)", "group": "Synth Pad"}
	, { "val": 91, "name": "Pad 4 (choir)", "group": "Synth Pad"}
	, { "val": 92, "name": "Pad 5 (bowed)", "group": "Synth Pad"}
	, { "val": 93, "name": "Pad 6 (metallic)", "group": "Synth Pad"}
	, { "val": 94, "name": "Pad 7 (halo)", "group": "Synth Pad"}
	, { "val": 95, "name": "Pad 8 (sweep)", "group": "Synth Pad"}
	
	, { "val": 96, "name": "FX 1 (rain)", "group": "Synth Effects"}
	, { "val": 97, "name": "FX 2 (soundtrack)", "group": "Synth Effects"}
	, { "val": 98, "name": "FX 3 (crystal)", "group": "Synth Effects"}
	, { "val": 99, "name": "FX 4 (atmosphere)", "group": "Synth Effects"}
	, { "val": 100, "name": "FX 5 (brightness)", "group": "Synth Effects"}
	, { "val": 101, "name": "FX 6 (goblins)", "group": "Synth Effects"}
	, { "val": 102, "name": "FX 7 (echoes)", "group": "Synth Effects"}
	, { "val": 103, "name": "FX 8 (sci-fi)", "group": "Synth Effects"}
	
	, { "val": 104, "name": "Sitar", "group": "Ethnic"}
	, { "val": 105, "name": "Banjo", "group": "Ethnic"}
	, { "val": 106, "name": "Shamisen", "group": "Ethnic"}
	, { "val": 107, "name": "Koto", "group": "Ethnic"}
	, { "val": 108, "name": "Kalimba", "group": "Ethnic"}
	, { "val": 109, "name": "Bagpipe", "group": "Ethnic"}
	, { "val": 110, "name": "Fiddle", "group": "Ethnic"}
	, { "val": 111, "name": "Shanai", "group": "Ethnic"}
	
	, { "val": 112, "name": "Tinkle Bell", "group": "Percussive"}
	, { "val": 113, "name": "Agogo", "group": "Percussive"}
	, { "val": 114, "name": "Steel Drums", "group": "Percussive"}
	, { "val": 115, "name": "Woodblock", "group": "Percussive"}
	, { "val": 116, "name": "Taiko Drum", "group": "Percussive"}
	, { "val": 117, "name": "Melodic Tom", "group": "Percussive"}
	, { "val": 118, "name": "Synth Drum", "group": "Percussive"}
	, { "val": 119, "name": "Reverse Cymbal", "group": "Percussive"}
	
	, { "val": 120, "name": "Guitar Fret Noise", "group": "Sound effects"}
	, { "val": 121, "name": "Breath Noise", "group": "Sound effects"}
	, { "val": 122, "name": "Seashore", "group": "Sound effects"}
	, { "val": 123, "name": "Bird Tweet", "group": "Sound effects"}
	, { "val": 124, "name": "Telephone Ring", "group": "Sound effects"}
	, { "val": 125, "name": "Helicopter", "group": "Sound effects"}
	, { "val": 126, "name": "Applause", "group": "Sound effects"}
	, { "val": 127, "name": "Gunshot", "group": "Sound effects"}
	];
}(this));