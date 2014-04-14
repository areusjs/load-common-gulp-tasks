'use strict';

var loadCommonGulpTasks = require('../index.js'),
/*jshint unused: true */
  should = require('should'),
/*jshint unused: false */
  sinon = require('sinon'),
  _ = require('lodash');

describe('options', function () {

  var gulp;

  function noop() {
  }

  beforeEach(function () {
    gulp = sinon.stub({task: noop, tasks: {
      help: {},
      lint: {},
      felint: {},
      cover: {},
      test: {},
      default: {}
    }});
  });

  it('should have default libPath', function () {
    loadCommonGulpTasks(gulp);
    gulp.options.libPath.should.eql('./lib');
  });

  it('should have custom libPath', function () {
    loadCommonGulpTasks(gulp, {
      libPath: 'repository'
    });
    gulp.options.libPath.should.eql('repository');
  });

  it('should have default paths', function () {
    loadCommonGulpTasks(gulp);

    should(_.keys(gulp.options.paths).length).eql(4);

    should(gulp.options.paths.lint.length).eql(3);
    should(_.contains(gulp.options.paths.lint, './gulpfile.js')).ok;
    should(_.contains(gulp.options.paths.lint, './lib/**/*.js')).ok;
    should(_.contains(gulp.options.paths.lint, '!./lib/*/content/**')).ok;

    should(gulp.options.paths.felint.length).eql(1);
    should(_.contains(gulp.options.paths.felint, './lib/*/content/**/*.js')).ok;

    should(gulp.options.paths.cover.length).eql(1);
    should(_.contains(gulp.options.paths.cover, './lib/*/lib/**/*.js')).ok;

    should(gulp.options.paths.test.length).eql(1);
    should(_.contains(gulp.options.paths.test, './lib/*/test/**/*.js')).ok;
  });

  it('should have custom paths', function () {
    loadCommonGulpTasks(gulp, {
      libPath: 'repository',
      paths: {
        lint: [
          'my_custom_file.js',
          'custom/glob/path/**/*.js'
        ]
      }
    });

    should(_.keys(gulp.options.paths).length).eql(4);

    should(gulp.options.paths.lint.length).eql(5);
    should(_.contains(gulp.options.paths.lint, 'my_custom_file.js')).ok;
    should(_.contains(gulp.options.paths.lint, 'custom/glob/path/**/*.js')).ok;
    should(_.contains(gulp.options.paths.lint, './gulpfile.js')).ok;
    should(_.contains(gulp.options.paths.lint, 'repository/**/*.js')).ok;
    should(_.contains(gulp.options.paths.lint, '!repository/*/content/**')).ok;

    should(gulp.options.paths.felint.length).eql(1);
    should(_.contains(gulp.options.paths.felint, 'repository/*/content/**/*.js')).ok;
  });

});