'use strict';

var loadCommonGulpTasks = require('../index.js'),
/*jshint unused: true */
  should = require('should'),
/*jshint unused: false */
  sinon = require('sinon');

describe('coverage', function () {

  var gulp;

  function noop() {
  }

  beforeEach(function () {
    gulp = sinon.stub({task: noop});
  });

  it('should have default config', function (done) {
    loadCommonGulpTasks(gulp);
    gulp.options.coverageSettings.should.eql({
      thresholds: {
        statements: 80,
        branches: 80,
        lines: 80,
        functions: 80
      },
      coverageDirectory: 'target/coverage',
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
      coverageDirectory: 'target/coverage',
      rootDirectory: ''
    });
    done();
  });

});