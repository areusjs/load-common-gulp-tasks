'use strict';

var gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  coverageEnforcer = require('gulp-istanbul-enforcer'),
  _ = require('lodash'),
  fs = require('fs');

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
        branches: 70,
        lines: 80,
        functions: 80
      },
      coverageDirectory: './target/coverage',
      rootDirectory: ''
    },
    paths: {
      lint: [
        './gulpfile.js',
        './lib/**/*.js',
        './test/**/*.js'
      ],
      felint: [
        './content/scripts/**/*.js'
      ],
      cover: [
        './lib/**/*.js'
      ],
      test: [
        './test/**/*.js'
      ]
    },
    jshintrc: {
      server: './node_modules/load-common-gulp-tasks/lint/.jshintrc',
      client: './node_modules/load-common-gulp-tasks/felint/.jshintrc'
    }
  };

  _.merge(gulp.options, options, function (a, b) {
    return _.isArray(a) ? b : undefined;
  });

  require('gulp-help')(gulp);

  function errorLogger(err) {
    gutil.beep();
    gutil.log(err.message);
  }

  gulp.task('lint', 'Lint server side js and fails on error', function () {
    gulp.src(gulp.options.paths.lint)
      .pipe(jshint(gulp.options.jshintrc.server))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });

  gulp.task('lint-show', 'Show full server side js lint report without failing', function () {
    gulp.src(gulp.options.paths.lint)
      .pipe(jshint(gulp.options.jshintrc.server))
      .pipe(jshint.reporter(stylish));
  });

  gulp.task('felint', 'Lint client side js and fail on error', function () {
    gulp.src(gulp.options.paths.felint)
      .pipe(jshint(gulp.options.jshintrc.client))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });

  gulp.task('felint-show', 'Show full client side js lint without failing', function () {
    gulp.src(gulp.options.paths.felint)
      .pipe(jshint(gulp.options.jshintrc.client))
      .pipe(jshint.reporter(stylish));
  });

  gulp.task('cover', 'Generate test coverage results', function (cb) {
    gulp.src(gulp.options.paths.cover)
      .pipe(istanbul())
      .on('end', cb);
  });

  gulp.task('test', 'Unit tests', ['cover'], function () {
    return gulp.src(gulp.options.paths.test)
      .pipe(mocha({reporter: 'dot'}))
      .pipe(istanbul.writeReports(gulp.options.coverageSettings.coverageDirectory))
      .pipe(coverageEnforcer(gulp.options.coverageSettings))
      .on('error', errorLogger);
  });

  gulp.task('default', 'All lint and tests', ['lint', 'felint', 'test']);
};
