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
			svg.attr('preserveAspectRatio', 'none');
			svg.attr('viewBox', '0 0 ' + data.length + ' ' + data[0].arr.length);
		};

		flat.draw = function (index) {
			var info;
			$svg.empty();
			
			// draw it
			if (data.length > 0) {
				info = data[index];
			}
			return info;
		};

		_init(settings);
		return flat;
	};
	
}(this));