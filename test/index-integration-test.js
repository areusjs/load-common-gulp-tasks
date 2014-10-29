'use strict';

var spawn = require('child_process').spawn,
  path = require('path'),
  fs = require('fs'),
/*jshint unused: true */
  should = require('should');
/*jshint unused: false */

describe('integration', function () {

  function printSpawnOutput(spawned) {
    //spawned.stdout.pipe(process.stdout);
    //spawned.stderr.pipe(process.stderr);
  }

  describe('basic', function () {

    var examplePath = path.join(__dirname, '../examples/basic');

    it('should pass gulp ci', function (done) {

      var gulpSpawn = spawn('gulp', ['ci'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', function (code) {
        should(code).eql(0);
        var coverageJson = require(path.join(examplePath, 'target/coverage/coverage-final.json'));
        var keys = Object.keys(coverageJson);
        should(keys.length).eql(2);
        keys.forEach(function (key) {
          /* jshint noempty: false */
          if (path.basename(key) === 'square.js' ||
            path.basename(key) === 'root.js') {
          } else {
            throw new Error('Unexpected file in coverage report: ' + key);
          }
          /* jshint noempty: true */
        });
        done();
      });

    });

  });

  describe('basic_failing', function () {

    var examplePath = path.join(__dirname, '../examples/basic_failing');

    it('should fail gulp ci', function (done) {
      var gulpSpawn = spawn('gulp', ['ci'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', function (code) {
        should(code).eql(1);
        done();
      });
    });

    it('should fail gulp lint', function (done) {
      var gulpSpawn = spawn('gulp', ['lint'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', function (code) {
        should(code).eql(1);
        done();
      });

    });

    it('should fail gulp felint', function (done) {
      var gulpSpawn = spawn('gulp', ['felint'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', function (code) {
        should(code).eql(1);
        done();
      });

    });

    it('should pass gulp test', function (done) {
      var gulpSpawn = spawn('gulp', ['test'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', function (code) {
        should(code).eql(0);
        done();
      });

    });

    it('should fail gulp test-cover', function (done) {
      var gulpSpawn = spawn('gulp', ['test-cover'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', function (code) {
        should(code).eql(1);
        var coverageJson = require(path.join(examplePath, 'target/coverage/coverage-final.json'));
        var keys = Object.keys(coverageJson);
        should(keys.length).eql(2);
        keys.forEach(function (key) {
          /* jshint noempty: false */
          if (path.basename(key) === 'square.js' ||
            path.basename(key) === 'root.js') {
          } else {
            throw new Error('Unexpected file in coverage report: ' + key);
          }
          /* jshint noempty: true */
        });
        done();
      });

    });

  });

});