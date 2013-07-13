/*global $, timbre, d3, sc, AudioSort */
(function (global) {
	'use strict';
	global.AudioPlayer = {};
	global.AudioPlayer.create = function (containerSelector, options) {
		var player = {},
			// State Variables
			isLooping, isPlaying, isReverse, isClicking = false,
			intervalIndex, hasMarkers,
			hoverIndex = -1,
			hoverValue = -1,
			clickIndex = -1,
			clickValue = -1,
			allowHover, allowClick,
			onClick,
			// Cached jQuery items
			$container, $svg, $positionCount, $swapCount, $slider,
			// Cached d3 items
			svg,
			// Data
			data, interval, env, pluck,
			// Functions
			_init, drawMarkers, drawSvg, ensureIntervalIndex, intervalCallback,
			getMidiNumber, getMidiNumberHelper, getPlayIndices,
			getIndexAndValueFromMouse,
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
			$positionCount = $container.find('.position-count');
			$swapCount = $container.find('.swap-count');
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
				});
				$svg.on('mouseout', function () {
					hoverIndex = -1;
					$svg.find('rect').attr('opacity', 1);
				});
			}

			// handle clicks
			if (allowClick) {
				$svg.on('mousedown', function (e) {
					var result = getIndexAndValueFromMouse(e);
					e.preventDefault();
					isClicking = true;
					clickIndex = result.index;
					clickValue = result.value;
					onClick(clickIndex, clickValue);
				});
				$svg.on('mouseup', function () {
					isClicking = false;
					clickIndex = -1;
					clickValue = -1;
				});
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
				n = data[intervalIndex].arr.length;
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
				drawMarkers(info, 1, 'highlight');
				drawMarkers(info, 2, 'justSwapped');
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

		player.setVolume = function (volume) {
			pluck.set({mul: volume});
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