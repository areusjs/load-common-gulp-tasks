'use strict';

var Promise = require('bluebird'),
/*jshint unused: true */
  should = require('should'),
  sinon = require('sinon'),
/*jshint unused: false */
  fs = Promise.promisifyAll(require('fs')),
  libPath = '../../lib',
  jshintrc = require(libPath + '/jshintrc/index');

describe('options', function () {

  beforeEach(function () {
    Promise.longStackTraces();
  });

  it('should be default jshintrc file', function (done) {
    jshintrc.generate(
      'lib/jshintrc/lint/.jshintrc',
      null
    )
      .then(function() {
        return Promise.all([
          fs.readFileAsync('.tmp/.lint_jshintrc', 'utf8'),
          fs.readFileAsync('lib/jshintrc/lint/.jshintrc', 'utf8')
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
    jshintrc.generate(
      'lib/jshintrc/lint/.jshintrc',
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