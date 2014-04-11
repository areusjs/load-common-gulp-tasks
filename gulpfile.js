'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  gutil = require('gulp-util'),
  mocha = require('gulp-mocha'),
/*jshint unused: true */
  colors = require('colors');
/*jshint unused: false */

function errorLogger(err) {
  gutil.beep();
  gutil.log(err.message);
}

gulp.task('lint', function (cb) {
  return gulp.src([
    './gulpfile.js',
    './index.js',
    './test/**/*.js'
  ])
    .pipe(jshint('./lint/.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    .on('error', errorLogger);
});

gulp.task('test', ['lint'], function () {
  // do NOT return the stream, otherwise watch won't continue on error
  gulp.src('./test/**/*.js')
    .pipe(mocha({reporter: 'dot'}))
    .on('error', errorLogger);
});

gulp.task('watch', function () {
  return gulp.watch([
    './index.js',
    './test/**/*.js'
  ], ['default']);
});

gulp.task('default', ['test']);