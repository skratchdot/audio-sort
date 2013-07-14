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