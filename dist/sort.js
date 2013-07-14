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
(function (global) {
	'use strict';
	
	global.visualization.flat = function (settings) {
		var flat = {},
			// settings
			data, $svg, svg,
			// functions
			_init;
		
		_init = function (settings) {
			data = settings.data;
			svg = settings.svg;
			$svg = settings.$svg;
			svg.attr('viewBox', '0 0 ' + data.length + ' ' + data[0].arr.length);
			svg.attr('preserveAspectRatio', 'none');
		};

		flat.draw = function () {
		};

		_init(settings);
		return flat;
	};
	
}(this));
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
/*global $, timbre, d3, sc, AudioSort */
(function (global) {
	'use strict';
	global.AudioPlayer = {};
	global.AudioPlayer.create = function (containerSelector, options) {
		var player = {},
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
			data, interval, env, pluck, visualization,
			// Functions
			_init, drawSvg, ensureIntervalIndex, intervalCallback,
			getMidiNumber, getMidiNumberHelper, getPlayIndices,
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

			// setup audio interval and envelopes
			env = timbre('perc', { a: 50, r: 2500 });
			pluck = timbre('PluckGen', {
				env: env,
				mul: AudioSort.getSelected('volume'),
				poly: 10
			}).on('ended', function () {
				if (!isPlaying) {
					this.pause();
				}
			});
			interval = timbre('interval', { interval: AudioSort.getSelected('tempo') }, intervalCallback);

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

		getMidiNumber = function (playValue) {
			var scale, octaveSize, degrees, degreeSize, centerValue, playMidi, centerMidi;

			// get some info from our current scale
			scale = sc.ScaleInfo.at(AudioSort.getSelected('scale'));
			octaveSize = scale.pitchesPerOctave();
			degrees = scale.degrees();
			degreeSize = degrees.length;
			centerValue = Math.floor(AudioSort.getSelected('dataSize') / 2);

			playMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, playValue);
			centerMidi = getMidiNumberHelper(degrees, degreeSize, octaveSize, centerValue);

			return playMidi + AudioSort.getSelected('centerNote') - centerMidi;
		};
		
		getMidiNumberHelper = function (degrees, degreeSize, octaveSize, position) {
			return degrees[position % degreeSize] + (Math.floor(position / degreeSize) * octaveSize);
		};

		getPlayIndices = function (snapshotItem) {
			var ret = [];
			if (snapshotItem.indices.length) {
				ret.push(snapshotItem.indices[0]);
			}
			return ret;
		};

		intervalCallback = function () {
			var midi, info, i, currentItem;
			if (isPlaying) {
				ensureIntervalIndex();
				refreshSliderPosition();

				// play if possible
				if (data.length > 0) {
					info = data[intervalIndex];
					for (i = 0; i < info.arr.length; i++) {
						currentItem = info.arr[i];
						if (currentItem.play) {
							midi = getMidiNumber(currentItem.value);
							if (midi >= 0 && midi < 128) {
								pluck.noteOn(midi, 64);
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
			$slider = AudioSort.createSlider(selector, {
				value: 0,
				min: 0,
				max: data.length - 1,
				step: 1
			}, onSliderPositionChange);
			visualization = global.visualization.bar({
				data: data,
				svg: svg,
				$svg: $svg,
				hasMarkers: hasMarkers,
				onClick: onClick
			});
			drawSvg();
		};

		player.setTempo = function (tempo) {
			interval.set({interval: tempo});
		};

		player.setVolume = function (volume) {
			pluck.set({mul: volume});
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
			pluck.play();
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

		// initialize player
		_init();

		return player;
	};
}(this));
/*global $, sc, ace, js_beautify, AudioPlayer, Worker */
(function (global) {
	'use strict';

	var AudioSort = {},
		// Pass jshint
		Fn = Function,
		// Default Settings
		defaults = {
			volume: { value: 0.25, min: 0, max: 1, step: 0.01 },
			tempo: { value: 120, min: 20, max: 300, step: 1 },
			centerNote: { value: 69, min: 0, max: 127, step: 1 },
			scale: { value: 'chromatic' },
			sort: { value: 'bubble' },
			dataSize: { value: 25, min: 4, max: 48, step: 1 }
		},
		// Currently Selected Items
		selected = {
			volume: defaults.volume.value,
			tempo: defaults.tempo.value,
			centerNote: defaults.centerNote.value,
			scale: defaults.scale.value,
			sort: defaults.sort.value,
			dataSize: defaults.dataSize.value
		},
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
		onSaveAlgorithmEdit,
		onSaveAlgorithmNew,
		buildSortOptions,
		clickPlayButton,
		doSort,
		getBaseDataAsFrames,
		getBaseDataAsPlayableObjects,
		getNoteName,
		getSortedScaleNames,
		getTempoString,
		onAudioDataButton,
		onScaleChange,
		onSlider,
		onSliderCenterNote,
		onSliderDataSize,
		onSliderTempo,
		onSliderVolume,
		onSortOptionSelected,
		onSortModalClick,
		onAddAlgorithmModalClick,
		populateSelect,
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

	onSlider = function (key, selector, event, fnFormat) {
		if (event) {
			selected[key] = event.value;
		}
		updateDisplayCache(selector, selected[key], fnFormat);
	};

	onSliderVolume = function (e) {
		onSlider('volume', '#volume-display', e, function (val) {
			return val.toFixed(2);
		});
		players.base.setVolume(selected.volume);
		players.sort.setVolume(selected.volume);
	};

	onSliderTempo = function (e) {
		var tempo = getTempoString();
		onSlider('tempo', '#tempo-display', e);
		players.base.setTempo(tempo);
		players.sort.setTempo(tempo);
	};

	onSliderCenterNote = function (e) {
		onSlider('centerNote', '#center-note-display', e, getNoteName);
	};

	onSliderDataSize = function (e) {
		onSlider('dataSize', '#data-size-display', e);
		baseData = maxData.slice(0, selected.dataSize);
		players.base.setData(getBaseDataAsFrames());
		doSort();
	};

	onScaleChange = function (e) {
		selected.scale = e.target.value;
	};

	onAudioDataButton = function () {
		var action = $(this).data('action');
		if (global.fn.datagen.hasOwnProperty(action)) {
			baseData = global.fn.datagen[action](selected.dataSize);
			players.base.setData(getBaseDataAsFrames());
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
		doSort();
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

	onSortModalClick = function () {
		var $modal = $('#sort-modal'),
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

	onSaveAlgorithmEdit = function () {
		global.sort[selected.sort] = new Fn(aceEditor.getValue());
		$('#sort-modal').modal('hide');
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
		$('#add-algorithm-modal').modal('hide');
		buildSortOptions('#sort-options');
	};

	onAddAlgorithmModalClick = function () {
		var $modal = $('#add-algorithm-modal');
		$modal.find('#new-sort-name').val('');
		addAceEditor('#new-sort-algorithm');
		$modal.modal();
	};

	getTempoString = function () {
		return 'bpm' + (parseFloat(selected.tempo) || 120) + ' l16';
	};

	setupPlayers = function () {
		players.base = AudioPlayer.create('#base-section', {
			env: env,
			pluck: pluck,
			isLooping: true,
			hasMarkers: false,
			allowHover: true,
			allowClick: true,
			onClick: function (index, value) {
				baseData[index] = value;
				players.base.setData(getBaseDataAsFrames());
				clearTimeout(clickTimer);
				clickTimer = setTimeout(doSort, clickDelay);
			},
			onPlayerButtonClickCallback: function (e) {
				if (e.action !== 'loop') {
					players.sort.stop();
				}
			}
		});
		players.sort = AudioPlayer.create('#sort-section', {
			env: env,
			pluck: pluck,
			isLooping: true,
			hasMarkers: true,
			onPlayerButtonClickCallback: function (e) {
				if (e.action !== 'loop') {
					players.base.stop();
				}
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

	populateSelect = function (originalSelector, chosenSelector, fnOnScaleChange) {
		var currentKey, lastKey, scale, scaleNames,
			numPitches, numDegrees,
			$select, $optgroup, $option;

		$select = $(originalSelector);
		scaleNames = getSortedScaleNames();
		$.each(scaleNames, function (index, scaleName) {
			// loop variables
			scale = sc.ScaleInfo.at(scaleName);
			numPitches = scale.pitchesPerOctave();
			numDegrees = scale.degrees().length;
			currentKey = numPitches + '_' + numDegrees;
			// setup optgroup
			if (currentKey !== lastKey) {
				if (lastKey) {
					$select.append($optgroup);
				}
				lastKey = currentKey;
				$optgroup = $('<optgroup />')
					.attr('label', 'Octave: ' + numPitches + ' / Notes: ' + numDegrees);
			}
			// add option
			$option = $('<option />')
				.val(scaleName)
				.text(scale.name);
			// make sure default item is selected
			if (selected.scale === scaleName) {
				$option.attr('selected', 'selected');
			}
			$optgroup.append($option);
		});
		$select.append($optgroup);
		$(originalSelector).chosen().change(fnOnScaleChange);
		$(chosenSelector).width('100%');
	};

	workerOnMessage = function (event) {
		var isSortPlaying = players.sort.isPlaying();
		if (event.data.key === workerKey) {
			players.sort.setData(event.data.frames || []);
			players.sort.goToFirst();
			if (isSortPlaying) {
				clickPlayButton();
			} 
		}
	};

	workerOnError = function (event) {
		console.log(event);
	};

	doSort = function () {
		if (typeof Worker === 'undefined') {
			return;
		}
		if (worker !== null) {
			worker.removeEventListener('message', workerOnMessage, false);
			worker.removeEventListener('error', workerOnError, false);
			worker.terminate();
		}
		workerKey = (new Date()).getTime();
		worker = new Worker(workerUrl);
		worker.addEventListener('message', workerOnMessage, false);
		worker.addEventListener('error', workerOnError, false);
		worker.postMessage({
			key : workerKey,
			fn : global.sort[selected.sort].toString(),
			arr : baseData
		});
	};

	AudioSort.createSlider = function (selector, obj, onChange) {
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

	AudioSort.getSelected = function (key, defaultValue) {
		return selected.hasOwnProperty(key) ? selected[key] : defaultValue;
	};

	AudioSort.init = function (webWorkerUrl) {
		if (typeof webWorkerUrl === 'string') {
			workerUrl = webWorkerUrl;
		}
		// build our sort options
		buildSortOptions('#sort-options');
		// setup audio and audio players
		setupPlayers();
		// setup base data
		baseData = global.fn.datagen.randomUnique(selected.dataSize);
		maxData = global.fn.datagen.sorted(defaults.dataSize.max);
		players.base.setData(getBaseDataAsFrames());
		// populate our scale drop down
		populateSelect('#scale-select', '#scale_select_chzn', onScaleChange);
		// create some of our sliders
		AudioSort.createSlider('#volume-container', defaults.volume, onSliderVolume);
		AudioSort.createSlider('#tempo-container', defaults.tempo, onSliderTempo);
		AudioSort.createSlider('#center-note-container', defaults.centerNote, onSliderCenterNote);
		AudioSort.createSlider('#data-size-container', defaults.dataSize, onSliderDataSize);
		// handle button clicks
		$('#sort-modal-open').on('click', onSortModalClick);
		$('#add-algorithm-btn').on('click', onAddAlgorithmModalClick);
		$('#save-algorithm-edit').on('click', onSaveAlgorithmEdit);
		$('#save-algorithm-new').on('click', onSaveAlgorithmNew);
		$('#base-buttons').on('click', '.btn', onAudioDataButton);
		$('#sort-options').on('click', 'li', onSortOptionSelected);
		$('#sort-options [data-sort=' + selected.sort + ']').click();
		// update slider selction text
		updateDisplayCache('#volume-display', selected.volume);
		updateDisplayCache('#tempo-display', selected.tempo);
		updateDisplayCache('#center-note-display', selected.centerNote, getNoteName);
		updateDisplayCache('#data-size-display', selected.dataSize);
	};

	global.AudioSort = AudioSort;
}(this));