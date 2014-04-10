var jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish');

module.exports = function (gulp) {

  gulp.task('lint', function () {
    gulp.src([
      'gulpfile.js',
      'lib/**/*.js',
      '!lib/*/coverage/**',
      '!lib/*/content/**'
    ])
      .pipe(jshint('./node_modules/load-common-gulp-tasks/lint/.jshintrc'))
      .pipe(jshint.reporter(stylish));
    //.pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });

  gulp.task('felint', function () {
    gulp.src(['lib/*/content/**/*.js'])
      .pipe(jshint('./node_modules/load-common-gulp-tasks/felint/.jshintrc'))
      .pipe(jshint.reporter(stylish));
    //.pipe(jshint.reporter('fail')); // fails on first encountered error instead of running full report.
  });

  gulp.task('default', ['lint', 'felint']);
};