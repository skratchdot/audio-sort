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