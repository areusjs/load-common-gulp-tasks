'use strict';

var gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  coverageEnforcer = require('gulp-istanbul-enforcer'),
  size,
  _ = require('lodash'),
  map = require('map-stream'),
  plato = require('gulp-plato'),
  fs = require('fs'),
  open = require('gulp-open');

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
    showStreamSize: false,
    // https://github.com/philbooth/complexity-report#command-line-options
    complexityOptions: {
    },
    complexityDestDir: './target/complexity'
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

  gulp.task('lint', 'Lint server side js', function () {
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

  gulp.task('lint-watch', false, function () {
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

  gulp.task('felint', 'Lint client side js', function () {
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

  gulp.task('felint-watch', false, function () {
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

  gulp.task('test-cover', 'Unit tests and coverage', function (cb) {
    return cover(function () {
      gulp.src(gulp.options.paths.test)
        .pipe(mocha({reporter: 'dot'}))
        .on('error', function (err) { // handler for mocha error
          testErrorHandler(err);
          process.emit('exit');
        })
        .pipe(size({
          title: 'test-cover'
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

  gulp.task('test-cover-watch', false, function (cb) {
    return cover(function () {
      gulp.src(gulp.options.paths.test)
        .pipe(mocha({reporter: 'dot'}))
        .on('error', testErrorHandler) // handler for mocha error
        .pipe(size({
          title: 'test-cover'
        }))
        .pipe(istanbul.writeReports(gulp.options.coverageSettings.coverageDirectory))
        .pipe(coverageEnforcer(gulp.options.coverageSettings))
        .on('error', testErrorHandler) // handler for istanbul error
        .on('end', cb);
    });
  });

  gulp.task('test', 'Unit tests only', function () {
    return gulp.src(gulp.options.paths.test)
      .pipe(mocha({reporter: 'dot'}))
      .on('error', function (err) { // handler for mocha error
        testErrorHandler(err);
        process.emit('exit');
      })
      .pipe(size({
        title: 'test'
      }));
  });

  gulp.task('test-watch', false, function (cb) {
    return gulp.src(gulp.options.paths.test)
      .pipe(mocha({
        reporter: 'min',
        G: true
      }))
      .on('error', testErrorHandler) // handler for mocha error
      .pipe(size({
        title: 'test-watch'
      }));
  });

  // ----------------
  // complexity
  // ----------------

  gulp.task('plato', 'Generate complexity analysis reports with plato', function (cb) {

    // http://james.padolsey.com/javascript/removing-comments-in-javascript/
    var commentRemovalRegex = /\/\*.+?\*\/|\/\/.*(?=[\n\r])/g,
      jshintJSON;

    fs.readFile(gulp.options.jshintrc.server, 'utf8', function (err, data) {
      if (err) {
        throw err;
      }
      jshintJSON = JSON.parse(data.replace(commentRemovalRegex, ''));

      gulp.src(gulp.options.paths.cover)
        .pipe(plato(gulp.options.complexityDestDir, {
          jshint: {
            options: jshintJSON
          },
          complexity: gulp.options.complexityOptions
        }));

      gulp.src(gulp.options.complexityDestDir + '/index.html')
        .pipe(open());

      cb();
    });

  });

  // ----------------
  // combo tasks
  // ----------------

  gulp.task('ci', 'Lint, tests and test coverage', ['lint', 'felint', 'test-cover']);

  gulp.task('ci-watch', false, ['lint-watch', 'felint-watch', 'test-cover-watch']);

  gulp.task('watch-all', 'Watch files and run all ci validation on change', function () {
    gulp.watch(gulp.options.paths.lint, ['ci-watch']);
  });

  gulp.task('watch', 'Watch files and run tests on change', function () {
    gulp.watch(gulp.options.paths.lint, ['test-watch']);
  });
};
