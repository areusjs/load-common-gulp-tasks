'use strict';

var gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  coverageEnforcer = require('gulp-istanbul-enforcer'),
  _ = require('lodash'),
  join = require('path').join,
  Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs'));

/**
 * Assigns default tasks to your gulp instance
 * @param {Gulp} gulp
 * @param {Object} [options] custom options
 */
module.exports = function (gulp, options) {
  var self = this,
    libPath = (options && options.libPath) ? options.libPath : '/lib';

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

    self.generateJshintrc(
      './node_modules/load-common-gulp-tasks/lint/.jshintrc',
      gulp.options.jshintrc.lint
    );

    gulp.src(gulp.options.paths.lint)
      .pipe(jshint('./node_modules/load-common-gulp-tasks/lint/.jshintrc'))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });

  gulp.task('felint', function () {
    gulp.src(gulp.options.paths.felint)
      .pipe(jshint('./node_modules/load-common-gulp-tasks/felint/.jshintrc'))
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

module.exports.generateJshintrc = function (defaultPath, customPath) {

  // http://james.padolsey.com/javascript/removing-comments-in-javascript/
  var commentRemovalRegex = /\/\*.+?\*\/|\/\/.*(?=[\n\r])/g;

  if (!customPath) {
    return fs.readFileAsync(defaultPath, 'utf8').then(function (data) {
      return fs.writeFileAsync('.tmp/.lint_jshintrc', data);
    });
  } else {
    return Promise.all([
      fs.readFileAsync(defaultPath, 'utf8'),
      fs.readFileAsync(customPath, 'utf8')
    ]).spread(function (defaultData, customData) {
      defaultData = defaultData.replace(commentRemovalRegex, '');
      customData = customData.replace(commentRemovalRegex, '');
      var jshintJSON = JSON.parse(defaultData);
      var customJSON = JSON.parse(customData);
      //console.log(defaultJSON, customJSON);
      _.merge(jshintJSON, customJSON, function (a, b) {
        return _.isArray(a) ? a.concat(b) : undefined;
      });
      return fs.writeFileAsync('.tmp/.lint_jshintrc', JSON.stringify(jshintJSON, null, 2));
    });
  }

  /*return fs.existsAsync('.tmp')
    .then(function (exists) {
      console.log('exists', exists);
      if (!exists) {
        return fs.mkdirAsync('./.tmp');
      }
      return Promise.resolve();
    }).catch(function (e) {
      console.log('ERROR!');
      console.error(e.stack);
      throw e;
    });*/
  /*.then(fs.readFileAsync(defaultPath))
  .then(function(data) {
    console.log(data);
    return fs.writeFileAsync('./.tmp/.lint_jshintrc', data);
  })*/

  /*fs.exists('.tmp', function(exists) {
    console.log('exists==>',exists);
  });*/

  /*return fs.existsAsync('.tmp');*/

  /*  fs.mkdir('./.tmp', function(err) {
      if (err) {
        throw err;
      }

      if (!customPath) {

        fs.readFile(defaultPath, function(err, data) {
          if (err) {
            throw err;
          }
          console.log(data);
          fs.writeFile('./.tmp/.lint_jshintrc', data, function(err) {
            if (err) {
              throw err;
            }
            //
          });
        });

      }

    });*/

};