'use strict';

module.exports = function(eleventyConfig) {
	['css', 'dist', 'img', 'js'].forEach(function(path) {
		eleventyConfig.addPassthroughCopy(path);
	});
	eleventyConfig.addPassthroughCopy('.nojekyll');

	return {
		dir: {
			input: '.',
			includes: '_includes',
			output: '_site'
		},
		htmlTemplateEngine: 'liquid',
		templateFormats: ['html']
	};
};
