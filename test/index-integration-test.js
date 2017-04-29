'use strict';

var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');

var /*jshint unused: true */
should = require('should');

/*jshint unused: false */

describe('integration', function () {

  this.timeout(9000);

  function printSpawnOutput(spawned) {
    //spawned.stdout.pipe(process.stdout);
    //spawned.stderr.pipe(process.stderr);
  }

  describe('basic', () => {

    var examplePath = path.join(__dirname, '../examples/basic');

    it('should pass gulp ci', done => {

      var gulpSpawn = spawn('gulp', ['ci'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', code => {
        try {
          should(code).eql(0);
          var coverageJson = require(path.join(examplePath, 'target/coverage/coverage-final.json'));
          var keys = Object.keys(coverageJson);
          should(keys.length).eql(2);
          keys.forEach(key => {
            /* jshint noempty: false */
            if (path.basename(key) === 'square.js' ||
              path.basename(key) === 'root.js') {
            } else {
              throw new Error('Unexpected file in coverage report: ' + key);
            }
            /* jshint noempty: true */
          });
        } catch (e) {
          return done(e);
        }
        done();
      });

    });

  });

  describe('basic_failing', () => {

    var examplePath = path.join(__dirname, '../examples/basic_failing');

    it('should fail gulp ci', done => {
      var gulpSpawn = spawn('gulp', ['ci'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', code => {
        try {
          should(code).eql(1);
        } catch (e) {
          return done(e);
        }
        done();
      });
    });

    it('should fail gulp lint', done => {
      var gulpSpawn = spawn('gulp', ['lint'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', code => {
        try {
          should(code).eql(1);
        } catch (e) {
          return done(e);
        }
        done();
      });

    });

    it('should fail gulp felint', done => {
      var gulpSpawn = spawn('gulp', ['felint'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', code => {
        try {
          should(code).eql(1);
        } catch (e) {
          return done(e);
        }
        done();
      });

    });

    it('should pass gulp test', done => {
      var gulpSpawn = spawn('gulp', ['test'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', code => {
        try {
          should(code).eql(0);
        } catch (e) {
          return done(e);
        }
        done();
      });

    });

    it('should fail gulp test-cover', done => {
      var gulpSpawn = spawn('gulp', ['test-cover'], {cwd: examplePath});
      printSpawnOutput(gulpSpawn);
      gulpSpawn.on('close', code => {
        try {
          should(code).eql(1);
          var coverageJson = require(path.join(examplePath, 'target/coverage/coverage-final.json'));
          var keys = Object.keys(coverageJson);
          should(keys.length).eql(2);
          keys.forEach(key => {
            /* jshint noempty: false */
            if (path.basename(key) === 'square.js' ||
              path.basename(key) === 'root.js') {
            } else {
              throw new Error('Unexpected file in coverage report: ' + key);
            }
            /* jshint noempty: true */
          });
        } catch (e) {
          return done(e);
        }
        done();
      });

    });

  });

});