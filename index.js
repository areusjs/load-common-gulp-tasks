'use strict';

var gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  coverageEnforcer = require('gulp-istanbul-enforcer'),
  _ = require('lodash');

/**
 * Assigns default tasks to your gulp instance
 * @param {Gulp} gulp
 * @param {Object} [options] custom options
 */
module.exports = function (gulp, options) {

  // defaults
  gulp.options = {
    coverageSettings: {
      thresholds: {
        statements: 80,
        branches: 80,
        lines: 80,
        functions: 80
      },
      coverageDirectory: 'coverage',
      rootDirectory: ''
    }
  };

  _.merge(gulp.options, options);

  function errorLogger(err) {
    gutil.beep();
    gutil.log(err.message);
  }

  gulp.task('lint', function () {
    gulp.src([
      'gulpfile.js',
      'lib/**/*.js',
      '!lib/*/coverage/**',
      '!lib/*/content/**'
    ])
      .pipe(jshint('./node_modules/load-common-gulp-tasks/lint/.jshintrc'))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });

  gulp.task('felint', function () {
    gulp.src(['lib/*/content/**/*.js'])
      .pipe(jshint('./node_modules/load-common-gulp-tasks/felint/.jshintrc'))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });

  gulp.task('cover', function (cb) {
    gulp.src('lib/*/lib/**/*.js')
      .pipe(istanbul())
      .on('end', cb);
  });

  gulp.task('test', ['cover'], function () {
    return gulp.src('lib/*/test/*.js')
      .pipe(mocha({reporter: 'dot'}))
      .pipe(istanbul.writeReports())
      .pipe(coverageEnforcer(gulp.options.coverageSettings))
      .on('error', errorLogger);
  });

  gulp.task('default', ['lint', 'felint', 'test']);
};