'use strict';

var gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  coverageEnforcer = require('gulp-istanbul-enforcer'),
  size,
  _ = require('lodash'),
  map = require('map-stream');

/**
 * Assigns default tasks to your gulp instance
 * @param {Gulp} gulp
 * @param {Object} [options] custom options
 */
module.exports = function (gulp, options) {

  // we need to track total errors and exit code manually since gulp doesn't have a good way to do this internally
  var exitCode = 0,
    totalLintErrors = 0,
    totalFelintErrors = 0;

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
    },
    showStreamSize: false
  };

  _.merge(gulp.options, options, function (a, b) {
    return _.isArray(a) ? b : undefined;
  });

  size = (gulp.options.showStreamSize) ? require('gulp-size') : require('./size-fake/index.js');

  require('gulp-help')(gulp);

  process.on('exit', function () {
    process.nextTick(function () {
      var msg = "gulp '" + gulp.seq + "' failed";
      console.log(gutil.colors.red(msg));
      process.exit(exitCode);
    });
  });

  function taskPassed(taskName) {
    var msg = "gulp '" + taskName + "' passed";
    console.log(gutil.colors.green(msg));
  }

  // cleanup all variables since, if we're running 'watch', they'll stick around in memory
  function beforeEach() {
    totalLintErrors = 0;
    totalFelintErrors = 0;
    exitCode = 0;
  }

  // ----------------
  // lint
  // ----------------

  function lint() {
    beforeEach();
    return gulp.src(gulp.options.paths.lint)
      .pipe(jshint(gulp.options.jshintrc.server))
      .pipe(jshint.reporter(stylish))
      .pipe(map(function (file, cb) {
        if (!file.jshint.success) {
          totalLintErrors += file.jshint.results.length;
          exitCode = 1;
        }
        cb(null, file);
      }));
  }

  function lintOnEnd() {
    var errString = totalLintErrors + '';
    if (exitCode) {
      console.log(gutil.colors.magenta(errString), 'errors\n');
      gutil.beep();
    } else {
      taskPassed('lint');
    }
  }

  gulp.task('lint', 'Lint server side js and fails on error', function () {
    return lint()
      .on('end', function () {
        lintOnEnd();
        if (exitCode) {
          process.emit('exit');
        }
      })
      .pipe(size({
        title: 'lint'
      }));
  });

  gulp.task('lint-watch', 'Show full server side js lint report without failing', function () {
    return lint()
      .on('end', lintOnEnd)
      .pipe(size({
        title: 'lint'
      }));
  });

  // ----------------
  // felint
  // ----------------

  function felint() {
    beforeEach();
    return gulp.src(gulp.options.paths.felint)
      .pipe(jshint(gulp.options.jshintrc.client))
      .pipe(jshint.reporter(stylish))
      .pipe(map(function (file, cb) {
        if (!file.jshint.success) {
          totalFelintErrors += file.jshint.results.length;
          exitCode = 1;
        }
        cb(null, file);
      }));
  }

  function felintOnEnd() {
    var errString = totalFelintErrors + '';
    if (exitCode) {
      console.log(gutil.colors.magenta(errString), 'errors\n');
      gutil.beep();
    } else {
      taskPassed('felint');
    }
  }

  gulp.task('felint', 'Lint client side js and fail on error', function () {
    return felint()
      .on('end', function () {
        felintOnEnd();
        if (exitCode) {
          process.emit('exit');
        }
      })
      .pipe(size({
        title: 'felint'
      }));
  });

  gulp.task('felint-watch', 'Show full client side js lint without failing', function () {
    return felint()
      .on('end', felintOnEnd)
      .pipe(size({
        title: 'felint'
      }));
  });

  // ----------------
  // test, cover
  // ----------------

  function testErrorHandler(err) {
    gutil.beep();
    gutil.log(err.message);
    exitCode = 1;
  }

  function cover(cb) {
    beforeEach();
    return gulp.src(gulp.options.paths.cover)
      .pipe(istanbul())
      .on('end', cb)
      .pipe(size({
        title: 'cover'
      }));
  }

  gulp.task('test', 'Unit tests and coverage', function (cb) {
    return cover(function () {
      gulp.src(gulp.options.paths.test)
        .pipe(mocha({reporter: 'dot'}))
        .on('error', function (err) { // handler for mocha error
          testErrorHandler(err);
          process.emit('exit');
        })
        .pipe(size({
          title: 'test'
        }))
        .pipe(istanbul.writeReports(gulp.options.coverageSettings.coverageDirectory))
        .pipe(coverageEnforcer(gulp.options.coverageSettings))
        .on('error', function (err) { // handler for istanbul error
          testErrorHandler(err);
          process.emit('exit');
        })
        .on('end', cb);
    });
  });

  gulp.task('test-watch', function (cb) {
    return cover(function () {
      gulp.src(gulp.options.paths.test)
        .pipe(mocha({
          reporter: 'min',
          G: true
        }))
        .on('error', testErrorHandler) // handler for mocha error
        .on('end', cb);
    });
  });

  // ----------------
  // combo tasks
  // ----------------

  gulp.task('ci', 'All lint and tests', ['lint', 'felint', 'test']);

  gulp.task('ci-watch', ['lint-watch', 'felint-watch', 'test-watch']);

  gulp.task('watch-all', 'Watch files and run ci', function () {
    gulp.watch(gulp.options.paths.lint, ['ci-watch']);
  });

  gulp.task('watch', function () {
    gulp.watch(gulp.options.paths.lint, ['test-watch']);
  });

  gulp.task('default', ['watch']);

};
