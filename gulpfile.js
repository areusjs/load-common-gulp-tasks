'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  gutil = require('gulp-util'),
  mocha = require('gulp-mocha'),
  shrinkwrap = require('gulp-shrinkwrap'),
  nicePackage = require('gulp-nice-package');

require('gulp-help')(gulp);

function errorLogger(err) {
  gutil.beep();
  gutil.log(err.message);
}

function lint() {
  return gulp.src([
    './*.js',
    './test/**/*.js'
  ])
    .pipe(jshint('./lint/.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    .on('error', errorLogger);
}

function test() {
  return gulp.src([
    './test/**/*.js',
    '!./test/helper/**'
  ])
    .pipe(mocha({reporter: 'dot'}))
    .on('error', errorLogger);
}

gulp.task('lint', function () {
  return lint();
});

gulp.task('test', ['lint'], function () {
  return test();
});

// when watching, do NOT return the stream, otherwise watch won't continue on error
gulp.task('lint-watch', false, function () {
  lint();
});

gulp.task('test-watch', false, ['lint-watch'], function () {
  test();
});

gulp.task('watch', function () {
  gulp.watch([
    './*.js',
    './test/**/*.js'
  ], ['test-watch']);
});

gulp.task('ci', 'Run all tests and lint.', ['test']);

gulp.task('shrinkwrap', 'Cleans package.json deps and generates npm-shrinkwrap.json', function () {
  return gulp.src('package.json')
    .pipe(nicePackage())
    .pipe(shrinkwrap())
    .pipe(gulp.dest('./'));
});