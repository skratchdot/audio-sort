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
			var info, line;

			// store info
			if (data.length > 0) {
				info = data[index];
			}

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

			return info;
		};

		flat.draw = function (index) {
			lines.attr('stroke', function (d) {
				return d.playIndexes.indexOf(index) >= 0 ? d.playColor : d.dataColor;
			});
		};
		

		_init(settings);
		return flat;
	};
	
}(this));