'use strict';

var loadCommonGulpTasks = require('../index.js'),
/*jshint unused: true */
  should = require('should'),
/*jshint unused: false */
  testData = require('./helper/test-data.js');

describe('coverage', function () {

  var gulp;

  beforeEach(function () {
    gulp = testData.gulpStub();
  });

  it('should have default config', function (done) {
    loadCommonGulpTasks(gulp);
    gulp.options.coverageSettings.should.eql({
      thresholds: {
        statements: 80,
        branches: 70,
        lines: 80,
        functions: 80
      },
      coverageDirectory: './target/coverage',
      rootDirectory: ''
    });
    done();
  });

  it('should have custom config', function (done) {
    loadCommonGulpTasks(gulp, {
      coverageSettings: {
        thresholds: {
          statements: 82, // higher than default
          branches: 65, // lower than default
          // lines not defined. use default
          functions: 65
        }
      }
    });
    gulp.options.coverageSettings.should.eql({
      thresholds: {
        statements: 82,
        branches: 65,
        lines: 80,
        functions: 65
      },
      coverageDirectory: './target/coverage',
      rootDirectory: ''
    });
    done();
  });

});