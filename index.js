'use strict';

var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var coverageEnforcer = require('gulp-istanbul-enforcer');
var size;
var _ = require('lodash');
var plato = require('gulp-plato');
var fs = require('fs');
var open = require('gulp-open');
var path = require('path');
var spawn = require('child_process').spawn;
var mapstream = require('map-stream');
var nicePackage = require('gulp-nice-package');
var shrinkwrap = require('gulp-shrinkwrap');

/**
 * Assigns default tasks to your gulp instance
 * @param {Gulp} gulp
 * @param {Object} [options] custom options
 */
module.exports = (gulp, options) => {
  // we need to track total errors and exit code manually since gulp doesn't have a good way to do this internally
  var exitCode = 0;

  var totalLintErrors = 0;
  var totalFelintErrors = 0;

  // defaults
  gulp.options = {
    istanbul: {
      includeUntested: true
    },
    istanbulWriteReports: {
      dir: './target/coverage'
    },
    istanbulEnforcer: {
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
        './*.js',
        './lib/**/*.js',
        './test/**/*.js'
      ],
      felint: [
        './content/**/*.js'
      ],
      cover: [
        './lib/**/*.js'
      ],
      test: [
        './test/**/*.js'
      ]
    },
    jshintrc: {
      server: path.join(__dirname, 'lint/.jshintrc'),
      client: path.join(__dirname, 'felint/.jshintrc')
    },
    showStreamSize: false,
    complexity: {
      destDir: './target/complexity',
      options: {} // https://github.com/philbooth/complexity-report#command-line-options
    },
    nicePackage: {
      spec: 'npm',
      options: {
        warnings: false,
        recommendations: false
      }
    },
    mocha: {
      timeout: 2000,
      reporter: 'dot'
    },
    'mochaWatch': {
      reporter: 'min',
      growl: true
    }
  };
  _.merge(gulp.options, options, (a, b) => _.isArray(a) ? b : undefined);

  // allow timeouts to be defined in one place in the simplest case of mocha configuration
  gulp.options.mochaWatch.timeout = gulp.options.mochaWatch.timeout || gulp.options.mocha.timeout;

  // support backwards compatibility to v0.3.2
  if (options && options.coverageSettings) {
    _.merge(gulp.options.istanbulEnforcer, options.coverageSettings);
    if (options.coverageSettings.coverageDirectory) {
      gulp.options.istanbulWriteReports.dir = options.coverageSettings.coverageDirectory;
    }
  }

  size = (gulp.options.showStreamSize) ? require('gulp-size') : require('./size-fake/index.js');

  require('gulp-help')(gulp, { aliases: ['h', '?']});

  process.on('exit', () => {
    // Exit with an exitCode of 0 is not an error.
    if (0 === exitCode) {
      return process.exit(exitCode);
    }
    process.nextTick(() => {
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
      .pipe(jshint.reporter(stylish, { verbose: true }))
      .pipe(mapstream((file, cb) => {
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

  gulp.task('lint', 'Lint server side js', () => lint()
    .on('end', () => {
      lintOnEnd();
      if (exitCode) {
        process.emit('exit');
      }
    })
    .pipe(size({
      title: 'lint'
    })));

  gulp.task('lint-watch', false, () => lint()
    .on('end', lintOnEnd)
    .pipe(size({
      title: 'lint'
    })));

  // ----------------
  // felint
  // ----------------

  function felint() {
    beforeEach();
    return gulp.src(gulp.options.paths.felint)
      .pipe(jshint(gulp.options.jshintrc.client))
      .pipe(jshint.reporter(stylish))
      .pipe(mapstream((file, cb) => {
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

  gulp.task('felint', 'Lint client side js', () => felint()
    .on('end', () => {
      felintOnEnd();
      if (exitCode) {
        process.emit('exit');
      }
    })
    .pipe(size({
      title: 'felint'
    })));

  gulp.task('felint-watch', false, () => felint()
    .on('end', felintOnEnd)
    .pipe(size({
      title: 'felint'
    })));

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
      .pipe(istanbul(gulp.options.istanbul))
      .on('finish', cb)
      .pipe(size({
        title: 'cover'
      }));
  }

  function coverOnEnd() {
    gutil.log('Wrote coverage reports to', gutil.colors.magenta(gulp.options.istanbulWriteReports.dir));
    // not calling cb() due to bug https://github.com/SBoudrias/gulp-istanbul/issues/22
  }

  gulp.task('test-cover', 'Unit tests and coverage', () => cover(() => gulp.src(gulp.options.paths.test)
    .pipe(mocha(gulp.options.mocha))
    .on('error', err => { // handler for mocha error
      testErrorHandler(err);
      process.emit('exit');
    })
    .pipe(size({
      title: 'test-cover'
    }))
    .pipe(istanbul.writeReports(gulp.options.istanbulWriteReports))
    .pipe(coverageEnforcer(gulp.options.istanbulEnforcer))
    .on('error', err => { // handler for istanbul error
      testErrorHandler(err);
      process.emit('exit');
    })
    .on('end', coverOnEnd)));

  gulp.task('test-cover-watch', false, () => cover(() => gulp.src(gulp.options.paths.test)
    .pipe(mocha(gulp.options.mocha))
    .on('error', testErrorHandler) // handler for mocha error
    .pipe(size({
      title: 'test-cover'
    }))
    .pipe(istanbul.writeReports(gulp.options.istanbulWriteReports))
    .pipe(coverageEnforcer(gulp.options.istanbulEnforcer))
    .on('error', testErrorHandler) // handler for istanbul error
    .on('end', coverOnEnd)));

  gulp.task('test', 'Unit tests only', () => gulp.src(gulp.options.paths.test)
    .pipe(mocha(gulp.options.mocha))
    .on('error', err => { // handler for mocha error
      testErrorHandler(err);
    })
    .pipe(size({
      title: 'test'
    }))
    .on('end', () => {
      exitCode = 0;
      process.emit('exit');
    }));

  gulp.task('test-watch', false, cb => gulp.src(gulp.options.paths.test)
    .pipe(mocha(gulp.options.mochaWatch))
    .on('error', testErrorHandler) // handler for mocha error
    .pipe(size({
      title: 'test-watch'
    })));

  gulp.task('test-debug', 'Run unit tests in debug mode', cb => {
    spawn('node', [
      '--debug-brk',
      path.join(__dirname, 'node_modules/gulp/bin/gulp.js'),
      'test'
    ], { stdio: 'inherit' });
  });

  // ----------------
  // complexity
  // ----------------

  gulp.task('plato', 'Generate complexity analysis reports with plato', cb => {
    // http://james.padolsey.com/javascript/removing-comments-in-javascript/
    var commentRemovalRegex = /\/\*.+?\*\/|\/\/.*(?=[\n\r])/g;

    var jshintJSON;

    fs.readFile(gulp.options.jshintrc.server, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      jshintJSON = JSON.parse(data.replace(commentRemovalRegex, ''));

      gulp.src(gulp.options.paths.cover)
        .pipe(plato(gulp.options.complexity.destDir, {
          jshint: {
            options: jshintJSON
          },
          complexity: gulp.options.complexity.options
        }));

      gulp.src(gulp.options.complexity.destDir + '/index.html')
        .pipe(open());

      cb();
    });
  });

  // ----------------
  // shrinkwrap
  // ----------------

  function validatePackageJson() {
    return gulp.src('package.json')
      .pipe(nicePackage(gulp.options.nicePackage.spec, gulp.options.nicePackage.options));
  }

  gulp.task('nice-package', 'Validates package.json', () => {
    var isValid = true;
    return validatePackageJson()
      .pipe(mapstream((file, cb) => {
        isValid = file.nicePackage.valid;
        cb(null, file);
      }))
      .on('end', () => {
        if (!isValid) {
          process.emit('exit');
        }
      });
  });

  gulp.task('shrinkwrap', 'Cleans package.json deps and generates npm-shrinkwrap.json', () => validatePackageJson()
    .pipe(shrinkwrap())
    .pipe(gulp.dest('./')));

  // ----------------
  // combo tasks
  // ----------------

  gulp.task('ci', 'Lint, tests and test coverage', ['lint', 'felint', 'test-cover', 'nice-package']);

  function getTestAndLintPaths() {
    var paths = gulp.options.paths.lint.concat(gulp.options.paths.test);
    return _.uniq(paths);
  }

  // separate task so "watch" can easily be overridden
  gulp.task('ci-watch', false, () => {
    gulp.watch(getTestAndLintPaths(), ['lint-watch', 'test-cover-watch']);
    gulp.watch(gulp.options.paths.felint, ['felint-watch']);
  });

  gulp.task('watch', 'Watch files and run all ci validation on change', ['ci-watch']);

  gulp.task('watch-test', 'Watch files and run tests on change', () => {
    gulp.watch(getTestAndLintPaths(), ['test-watch']);
  });

  return gulp;
};
