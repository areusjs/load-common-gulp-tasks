'use strict';

var loadCommonGulpTasks = require('../../index.js'),
/*jshint unused: true */
  should = require('should'),
/*jshint unused: false */
  sinon = require('sinon'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs'));

describe('options', function () {

  var gulp;

  function noop() {
  }

  beforeEach(function () {
    Promise.longStackTraces();
    gulp = sinon.stub({task: noop});
  });

  it('should be default jshintrc file', function (done) {
    loadCommonGulpTasks(gulp);

    loadCommonGulpTasks.generateJshintrc(
      'lint/.jshintrc',
      null
    )
      .then(function() {
        return Promise.all([
          fs.readFileAsync('.tmp/.lint_jshintrc', 'utf8'),
          fs.readFileAsync('lint/.jshintrc', 'utf8')
        ]);
      })
      .spread(function (actualData, expectedData){
        should(actualData).eql(expectedData);
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  it('should be custom jshintrc file', function (done) {
    loadCommonGulpTasks(gulp);

    loadCommonGulpTasks.generateJshintrc(
      'lint/.jshintrc',
      'test/jshintrc/.custom_jshintrc'
    )
      .then(function() {
        return Promise.all([
          fs.readFileAsync('.tmp/.lint_jshintrc', 'utf8'),
          fs.readFileAsync('test/jshintrc/.custom_jshintrc_result', 'utf8')
        ]);
      })
      .spread(function(actualData, expectedData) {
        should(actualData).eql(expectedData);
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

});