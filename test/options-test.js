'use strict';

var loadCommonGulpTasks = require('../index.js'),
/*jshint unused: true */
  should = require('should'),
/*jshint unused: false */
  testData = require('./helper/test-data.js'),
  _ = require('lodash');

describe('options', function () {

  var gulp;

  beforeEach(function () {
    gulp = testData.gulpStub();
  });

  it('should have default paths', function () {
    loadCommonGulpTasks(gulp);

    should(_.keys(gulp.options.paths).length).eql(4);

    should(gulp.options.paths.lint.length).eql(3);
    should(_.contains(gulp.options.paths.lint, './*.js')).ok;
    should(_.contains(gulp.options.paths.lint, './lib/**/*.js')).ok;
    should(_.contains(gulp.options.paths.lint, './test/**/*.js')).ok;

    should(gulp.options.paths.felint.length).eql(1);
    should(_.contains(gulp.options.paths.felint, './content/**/*.js')).ok;

    should(gulp.options.paths.cover.length).eql(1);
    should(_.contains(gulp.options.paths.cover, './lib/**/*.js')).ok;

    should(gulp.options.paths.test.length).eql(1);
    should(_.contains(gulp.options.paths.test, './test/**/*.js')).ok;
  });

  it('should have custom paths', function () {
    loadCommonGulpTasks(gulp, {
      paths: {
        lint: [
          'my_custom_file.js',
          'custom/glob/path/**/*.js'
        ]
      }
    });

    should(_.keys(gulp.options.paths).length).eql(4);

    should(gulp.options.paths.lint.length).eql(2);
    should(_.contains(gulp.options.paths.lint, 'my_custom_file.js')).ok;
    should(_.contains(gulp.options.paths.lint, 'custom/glob/path/**/*.js')).ok;

    should(gulp.options.paths.felint.length).eql(1);
    should(_.contains(gulp.options.paths.felint, './content/**/*.js')).ok;
  });

});