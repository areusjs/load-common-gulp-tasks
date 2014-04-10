var jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish');

module.exports = function (gulp) {

  gulp.task('lint', function () {
    gulp.src(['gulpfile.js', 'lib/**/*.js', '!**/coverage/lcov-report/**'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
      //.pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });
};