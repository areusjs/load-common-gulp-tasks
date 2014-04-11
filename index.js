'use strict';

var gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  coverageEnforcer = require('gulp-istanbul-enforcer'),
  _ = require('lodash'),
  join = require('path').join,
  jshintrc = require('./lib/jshintrc/index');

/**
 * Assigns default tasks to your gulp instance
 * @param {Gulp} gulp
 * @param {Object} [options] custom options
 */
module.exports = function (gulp, options) {
  var libPath = (options && options.libPath) ? options.libPath : '/lib';

  // defaults
  gulp.options = {
    libPath: libPath,
    coverageSettings: {
      thresholds: {
        statements: 80,
        branches: 80,
        lines: 80,
        functions: 80
      },
      coverageDirectory: 'target/coverage',
      rootDirectory: ''
    },
    paths: {
      lint: [
        'gulpfile.js',
        join(libPath, '/**/*.js'),
          '!' + join(libPath, '/*/coverage/**'),
          '!' + join(libPath, '/*/content/**')
      ],
      felint: [
        join(libPath, '/*/content/**/*.js')
      ],
      cover: [
        join(libPath, '/*/lib/**/*.js')
      ],
      test: [
        join(libPath, '/*/test/**/*.js')
      ]
    },
    jshintrc: {
      lint: null,
      felint: null
    }
  };

  _.merge(gulp.options, options, function (a, b) {
    return _.isArray(a) ? a.concat(b) : undefined;
  });

  function errorLogger(err) {
    gutil.beep();
    gutil.log(err.message);
  }

  gulp.task('lint', function () {

    jshintrc.generate(
      './node_modules/load-common-gulp-tasks/lib/jshintrc/lint/.jshintrc',
      gulp.options.jshintrc.lint
    ).then(function() {
        gulp.src(gulp.options.paths.lint)
          .pipe(jshint('.tmp/.lint_jshintrc'))
          .pipe(jshint.reporter(stylish))
          .pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
      });

  });

  gulp.task('felint', function () {
    gulp.src(gulp.options.paths.felint)
      .pipe(jshint('./node_modules/load-common-gulp-tasks/lib/jshintrc/felint/.jshintrc'))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });

  gulp.task('cover', function (cb) {
    gulp.src(gulp.options.paths.cover)
      .pipe(istanbul())
      .on('end', cb);
  });

  gulp.task('test', ['cover'], function () {
    return gulp.src(gulp.options.paths.test)
      .pipe(mocha({reporter: 'dot'}))
      .pipe(istanbul.writeReports())
      .pipe(coverageEnforcer(gulp.options.coverageSettings))
      .on('error', errorLogger);
  });

  gulp.task('default', ['lint', 'felint', 'test']);
};