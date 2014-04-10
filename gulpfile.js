'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish');

gulp.task('lint', function () {
  gulp.src([
    'gulpfile.js',
    'index.js'
  ])
    .pipe(jshint('lint/.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});