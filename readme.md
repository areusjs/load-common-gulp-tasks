# load-common-gulp-tasks

Load common gulp tasks and configs so you don't need to redefine them for every module

## Usage

* `gulp test` Run tests, with code coverage, across all modules under `/lib`
* `gulp cover` Generate test coverage report
* `gulp lint` Run jshint on all server js
* `gulp felint` Run jshint on all client js

## Example Config
basic `gulpfile.js`

```js
var gulp = require('gulp');
require('load-common-gulp-tasks')(gulp);
```

To override default tasks or create new ones, simply define them after calling `require('load-common-gulp-tasks')(gulp);`, e.g.

```js
gulp.task('watch', function () {
  gulp.watch(['lib/*/sass/*.scss'], ['styles']);
});

gulp.task('styles', function () {
  return gulp.src(sassFiles)
    .pipe(sass({
      includePaths: ['lib/*/sass']
    }))
    .pipe(gulp.dest('content/styles'));
});
```