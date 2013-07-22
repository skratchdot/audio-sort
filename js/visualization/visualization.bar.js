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