'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var shrinkwrap = require('gulp-shrinkwrap');
var nicePackage = require('gulp-nice-package');

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

gulp.task('lint', () => lint());

gulp.task('test', ['lint'], () => test());

// when watching, do NOT return the stream, otherwise watch won't continue on error
gulp.task('lint-watch', false, () => {
  lint();
});

gulp.task('test-watch', false, ['lint-watch'], () => {
  test();
});

gulp.task('watch', () => {
  gulp.watch([
    './*.js',
    './test/**/*.js'
  ], ['test-watch']);
});

gulp.task('ci', 'Run all tests and lint.', ['test']);

gulp.task('shrinkwrap', 'Cleans package.json deps and generates npm-shrinkwrap.json', () => gulp.src('package.json')
  .pipe(nicePackage())
  .pipe(shrinkwrap())
  .pipe(gulp.dest('./')));