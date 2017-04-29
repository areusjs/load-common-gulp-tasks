'use strict';

var loadCommonGulpTasks = require('../index.js');

var /*jshint unused: true */
should = require('should');

var /*jshint unused: false */
testData = require('./helper/test-data.js');

describe('coverage', () => {

  var gulp;

  beforeEach(() => {
    gulp = testData.gulpStub();
  });

  describe('should support deprecated configuration', () => {

    it('when custom config', done => {
      loadCommonGulpTasks(gulp, {
        istanbul: {
          includeUntested: false
        },
        coverageSettings: {
          thresholds: {
            statements: 82, // higher than default
            branches: 65, // lower than default
            // lines not defined. use default
            functions: 65
          },
          coverageDirectory: './custom/coverage/dir'
        }
      });
      gulp.options.istanbul.should.eql({
        includeUntested: false
      });
      gulp.options.istanbulWriteReports.should.eql({
        dir: './custom/coverage/dir'
      });
      gulp.options.istanbulEnforcer.should.eql({
        thresholds: {
          statements: 82,
          branches: 65,
          lines: 80,
          functions: 65
        },
        coverageDirectory: './custom/coverage/dir',
        rootDirectory: ''
      });
      done();
    });

  });

  describe('should support latest configuration', () => {

    it('when default config', done => {
      loadCommonGulpTasks(gulp);
      gulp.options.istanbul.should.eql({
        includeUntested: true
      });
      gulp.options.istanbulWriteReports.should.eql({
        dir: './target/coverage'
      });
      gulp.options.istanbulEnforcer.should.eql({
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

    it('when custom config', done => {
      loadCommonGulpTasks(gulp, {
        istanbul: {
          includeUntested: false
        },
        istanbulWriteReports: {
          dir: './custom/coverage/dir'
        },
        istanbulEnforcer: {
          thresholds: {
            statements: 82, // higher than default
            branches: 65, // lower than default
            // lines not defined. use default
            functions: 65
          }
        }
      });
      gulp.options.istanbul.should.eql({
        includeUntested: false
      });
      gulp.options.istanbulWriteReports.should.eql({
        dir: './custom/coverage/dir'
      });
      gulp.options.istanbulEnforcer.should.eql({
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

});