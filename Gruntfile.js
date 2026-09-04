"use strict";

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: "<json:package.json>",
    concat: {
      styles: {
        src: [
          "css/bootstrap.css",
          "css/bootstrap-responsive.css",
          "css/slider.css",
          "css/audio-sort.css",
          "css/audio-sort-responsive.css",
        ],
        dest: "dist/styles.css",
      },
      sort: {
        src: [
          "js/fn/*.js",
          "js/sort/*.js",
          "js/visualization/*.js",
          "js/AS.js",
          "js/_A.js",
          "js/A.Helper.js",
          "js/A.MidiExport.js",
          "js/A.Player.js",
          "js/A.Sort.js",
          "js/A.instruments.js",
        ],
        dest: "dist/sort.js",
      },
      worker: {
        src: ["js/AS.js", "js/SortWorker.js"],
        dest: "dist/worker.js",
      },
    },
    cssmin: {
      minify: {
        expand: true,
        cwd: "dist/",
        src: ["styles.css"],
        dest: "dist/",
        ext: ".min.css",
      },
    },
    uglify: {
      options: {
        preserveComments: "some",
      },
      dist: {
        files: {
          "dist/sort.min.js": ["dist/sort.js"],
          "dist/worker.min.js": ["dist/worker.js"],
        },
      },
    },
    watch: {
      lib: {
        files: ["js/*.js", "js/fn/*.js", "js/sort/*.js", "js/visualization/*.js"],
        tasks: ["concat", "uglify"],
      },
      css: {
        files: ["css/*.css"],
        tasks: ["concat", "cssmin"],
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  // Default task.
  grunt.registerTask("default", ["build"]);
  grunt.registerTask("build", ["concat", "cssmin", "uglify"]);
};
