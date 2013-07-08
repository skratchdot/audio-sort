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
				AS.next();
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
				AS.gt(j, i); // just marking as a compare
				if (secondValue > firstValue) {
					AS.swap(j, j + 1);
				}
				AS.next();
			}
			AS.next();
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
				AS.next();
			}
			if (i !== min) {
				AS.swap(i, min);
			}
		}
		AS.next();
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
/*global $, timbre, d3, sc, AudioSort */
(function (global) {
	'use strict';
	global.AudioPlayer = {};
	global.AudioPlayer.create = function (containerSelector, options) {
		var player = {},
			// State Variables
			isLooping, isPlaying, isReverse,
			intervalIndex, hasMarkers,
			// Cached jQuery items
			$container, $positionCount, $swapCount, $slider,
			// Cached d3 items
			svg,
			// Data
			data, interval, env, pluck,
			// Functions
			_init, drawMarkers, drawSvg, ensureIntervalIndex, intervalCallback,
			getMidiNumber, getMidiNumberHelper, getPlayIndices,
			// Event Listeners
			onPlayerButtonClick,
			onPlayerButtonClickCallback,
			onSliderPositionChange
			;

		_init = function () {
			options = options || {};

			// we need 2 timbre objects: env & pluck
			if (!options.hasOwnProperty('env') || !options.hasOwnProperty('pluck')) {
				throw new Error('Invalid "env" or "pluck" passed to AudioPlayer.create(options)');
			} else {
				env = options.env;
				pluck = options.pluck;
			}

			// setup some more variables
			isLooping = options.isLooping || false;
			isPlaying = options.isPlaying || false;
			isReverse = options.isReverse || false;
			hasMarkers = options.hasMarkers || false;
			intervalIndex = 0;
			$container = $(containerSelector || null);
			$positionCount = $container.find('.position-count');
			$swapCount = $container.find('.swap-count');
			svg = d3.select('#' + $container.find('svg').attr('id'));
			onPlayerButtonClickCallback = options.onPlayerButtonClickCallback || null;

			// setup audio interval
			interval = timbre('interval', { interval: AudioSort.getSelected('tempo') }, intervalCallback);
			// listen for player button clicks
			$container.find('.player-buttons').on('click', '.btn', onPlayerButtonClick);
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

		drawSvg = function () {
			var info, rect, len;
			ensureIntervalIndex();
			// draw it
			if (data.length > 0) {
				info = data[intervalIndex];

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
				drawMarkers(info, 1, 'markTwo');
				drawMarkers(info, 3, 'swap');
				drawMarkers(info, 4, 'compare');
				drawMarkers(info, 5, 'mark');
				//drawMarkers(info, 5, 'play');

				// position count
				$positionCount.text(parseInt(intervalIndex + 1, 10) + ' / ' + data.length);

				// swap count
				if ($swapCount.length) {
					$swapCount.text('c:' + info.compareCount + ' / s:' + info.swapCount);
				}
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
				if ($slider.length) {
					$slider.slider('setValue', intervalIndex);
				}

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
			} else if (action === 'loop') {
				isLooping = !$item.hasClass('active');
				if (isLooping) {
					$item.addClass('active');
				} else {
					$item.removeClass('active');
				}
			}
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
			drawSvg();
		};

		player.setTempo = function (tempo) {
			interval.set({interval: tempo});
		};

		player.play = function (reverse) {
			interval.stop();
			isPlaying = true;
			if (reverse === true) {
				isReverse = true;
				intervalIndex = data.length - 1;
			} else {
				isReverse = false;
				intervalIndex = 0;
			}
			isReverse = reverse === true ? true : false;
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
			isReverse = false;
			intervalIndex = 0;
			ensureIntervalIndex();
			drawSvg();
		};

		player.goToLast = function () {
			isReverse = false;
			intervalIndex = data.length - 1;
			ensureIntervalIndex();
			drawSvg();
		};

		player.goToIndex = function (index) {
			isReverse = false;
			intervalIndex = index;
			ensureIntervalIndex();
			drawSvg();
		};

		// initialize player
		_init();

		return player;
	};
}(this));
/*global $, timbre, sc, ace, AudioPlayer, Worker */
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
		autoPlayOnSortEnabled = false,
		// Web Workers
		worker = null,
		workerKey,
		workerUrl = 'dist/worker.min.js',
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
		setupAudio,
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
				swap: false,
				compare: false,
				mark: false,
				markTwo: false
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
		pluck.set({mul: selected.volume});
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
		doSort(true, false);
	};

	onScaleChange = function (e) {
		selected.scale = e.target.value;
	};

	onAudioDataButton = function () {
		var action = $(this).data('action');
		if (global.fn.datagen.hasOwnProperty(action)) {
			baseData = global.fn.datagen[action](selected.dataSize);
			players.base.setData(getBaseDataAsFrames());
			players.base.goToFirst();
			if (players.base.isPlaying()) {
				players.base.play();
			}
			doSort(true, false);
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
		doSort(true, autoPlayOnSortEnabled);
	};
	
	addAceEditor = function (container) {
		var $container = $(container),
			id = 'id_' + (new Date()).getTime();
		$container.empty().append('<div class="js-editor" id="' + id + '"></div>');
		aceEditor = ace.edit(id);
		aceEditor.setTheme('ace/theme/monokai');
		aceEditor.getSession().setMode('ace/mode/javascript');
	};

	onSortModalClick = function () {
		var $modal = $('#sort-modal'),
			selectedSort = global.sort[selected.sort],
			fnArray;
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
		aceEditor.setValue(fnArray.splice(1, fnArray.length - 2).join('\n'));
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
		global.sort[id] = new Fn(aceEditor.getValue());
		global.sort[id].display = name;
		global.sort[id].stable = true;
		global.sort[id].best = '';
		global.sort[id].average = '';
		global.sort[id].worst = '';
		global.sort[id].memory = '';
		global.sort[id].method = '';
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

	setupAudio = function () {
		env = timbre('perc', { a: 50, r: 2500 });
		pluck = timbre('PluckGen', { env: env, mul: selected.volume, poly: 10 }).play();
	};

	setupPlayers = function () {
		players.base = AudioPlayer.create('#base-section', {
			env: env,
			pluck: pluck,
			isLooping: true,
			hasMarkers: false,
			onPlayerButtonClickCallback: function (e) {
				if (e.action !== 'loop') {
					players.sort.stop();
				}
			}
		});
		players.sort = AudioPlayer.create('#sort-section', {
			env: env,
			pluck: pluck,
			isLooping: false,
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

	doSort = function (moveToFront, startPlaying) {
		if (typeof Worker === 'undefined') {
			return;
		}
		if (worker !== null) {
			worker.terminate();
		}
		workerKey = (new Date()).getTime();
		worker = new Worker(workerUrl);
		worker.addEventListener('message', function (event) {
			var isSortPlaying = players.sort.isPlaying();
			if (event.data.key === workerKey) {
				players.sort.setData(event.data.frames || []);

				if (isSortPlaying || moveToFront) {
					players.sort.goToFirst();
				}
				if (isSortPlaying || startPlaying) {
					clickPlayButton();
				} 
			}
		}, false);
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
		setupAudio();
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
		// after we have artificially clicked the default sort, we can
		// set the autoPlayOnSortEnabled flag so that future click trigger the play button
		autoPlayOnSortEnabled = true;
		// update slider selction text
		updateDisplayCache('#volume-display', selected.volume);
		updateDisplayCache('#tempo-display', selected.tempo);
		updateDisplayCache('#center-note-display', selected.centerNote, getNoteName);
		updateDisplayCache('#data-size-display', selected.dataSize);
	};

	global.AudioSort = AudioSort;
}(this));