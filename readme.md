# load-common-gulp-tasks [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]
> Load common [gulp](http://gulpjs.com/) tasks and configs so you don't need to redefine them for every module

Supplies a common interface to the following gulp modules:

1. [gulp-mocha](https://github.com/sindresorhus/gulp-mocha)
2. [gulp-jshint](https://github.com/spenceralger/gulp-jshint)
3. [gulp-istanbul](https://github.com/SBoudrias/gulp-istanbul)
4. [gulp-istanbul-enforcer](https://github.com/iainjmitchell/gulp-istanbul-enforcer)
5. [gulp-plato](https://github.com/sindresorhus/gulp-plato)
6. [gulp-help](https://github.com/chmontgomery/gulp-help)
6. [gulp-nice-package](https://github.com/chmontgomery/gulp-nice-package)
6. [gulp-shrinkwrap](https://github.com/chmontgomery/gulp-shrinkwrap)

## Available Tasks

`gulp help` for available tasks. Right now these are the default tasks:

![](screenshot.png)

### Debug Tests

You can debug your mocha tests using a tool like [node-inspector](https://github.com/node-inspector/node-inspector)
combined with the `gulp test-debug` target

## Basic Usage

```js
// gulpfile.js
var gulp = require('load-common-gulp-tasks')(require('gulp'));
```

## Options

`load-common-gulp-tasks` tries to assume smart defaults but also attempts to be very configurable.
Each option can be overridden by passing an `options` object as the second parameter,
e.g. `require('load-common-gulp-tasks')(gulp, options);`

### options.istanbul

Type: `Object`

Default:
```js
{
  includeUntested: true
}
```

[See here for all available options](https://github.com/SBoudrias/gulp-istanbul#istanbulopt)

### options.istanbulWriteReports

Type: `Object`

Default:
```js
{
  dir: './target/coverage'
}
```

[See here for all available options](https://github.com/SBoudrias/gulp-istanbul#istanbulwritereportsopt)

### options.istanbulEnforcer

Type: `Object`

Default:
```js
{
  thresholds: {
    statements: 80,
    branches: 70,
    lines: 80,
    functions: 80
  },
  coverageDirectory: './target/coverage',
  rootDirectory: ''
}
```

[See here for all available options](https://github.com/iainjmitchell/gulp-istanbul-enforcer#options)

### options.paths

Type: `Object`

Default:
```js
{
  lint: [
    './*.js',
    './lib/**/*.js',
    './test/**/*.js'
  ],
  felint: [
    './content/**/*.js'
  ],
  cover: [
    './lib/**/*.js'
  ],
  test: [
    './test/**/*.js'
  ]
}
```

Glob paths used by the associated targets

### options.jshintrc.server

Type: `String`

Default: `node_modules/load-common-gulp-tasks/lint/.jshintrc`

`.jshintrc` file to use when running `gulp lint` target

### options.jshintrc.client

Type: `String`

Default: `node_modules/load-common-gulp-tasks/felint/.jshintrc`

`.jshintrc` file to use when running `gulp felint` target

### options.complexity.destDir

Type: `String`

Default: `./target/complexity`

Report destination.

### options.complexity.options

Type: `Object`

Default: `{}`

[Options](https://github.com/philbooth/complexity-report#command-line-options) passed to complexity-report.

### options.showStreamSize

Type: `Boolean`

Default: `false`

Optionally show the gulp stream size of each task

### options.nicePackage.spec

Type: `String`

Default: `npm`

spec option for [package.json-validator](https://github.com/gorillamania/package.json-validator#api)

### options.nicePackage.options

Type: `Object`

Default: 
```js
{
    warnings: false,
    recommendations: false
}
```

spec option for [package.json-validator](https://github.com/gorillamania/package.json-validator#api)

### options.mocha

Type: `Object`

Default:
```js
{
    timeout: 2000,
    reporter: 'dot'
}
```

These options are passed to gulp-mocha in testing tasks.

If a `timeout` option is given, it will also be used as a default value
for `options.mochaWatch`, used in 'watching' test tasks.

[See here for all available options](https://github.com/sindresorhus/gulp-mocha#mochaoptions)

### options.mochaWatch

Type: `Object`

Default:
```js
{
    timeout: 2000,  // overriden by options.mocha.timeout if present
    reporter: 'min',
    growl: true
}
```

If a `timeout` option is not given here, but in options.mocha, it will be used here. These options are passed to gulp-mocha when used in 'watching' tests.

[See here for all available options](https://github.com/sindresorhus/gulp-mocha#mochaoptions) Note: some options, like `growl`, remain undocumented.

## Advanced Usage

To override default tasks or create new ones, simply define them after calling `require('load-common-gulp-tasks')(gulp);` in your `gulpfile.js`, e.g.

```js
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  sassFiles = './lib/*/sass/*.scss',
  options;

// ------------------------
// custom coverage settings
// ------------------------
options = {
  istanbulEnforcer: {
    thresholds: {
      statements: 83, // higher than default
      branches: 59, // lower than default
      // lines not defined. use default
      functions: 58
    }
  }
};

// ------------------------
// load common tasks
// ------------------------
require('load-common-gulp-tasks')(gulp, options);

// ------------------------
// custom tasks
// ------------------------
gulp.task('watch', 'Watch sass files and recompile on change', function () {
  gulp.watch(sassFiles, ['styles']);
});

gulp.task('styles', 'Compile sass to css', function () {
  return gulp.src(sassFiles)
    .pipe(sass())
    .pipe(gulp.dest('./public'));
});
```

## ES6 Support

Since Node 0.11.13, ES6 functionality is available to applications with the harmony flag. In order to enable ES6 support just add --harmony with your task
    
    gulp ci --harmony
    
All tasks with the exception of "test-cover" work using --harmony flag. In order to use test-cover, either override the specific task or as an alternative you can use the #harmony branch, which points to a similar branch for gulp-istanbul.


## License

[MIT](http://opensource.org/licenses/MIT) © [Chris Montgomery](http://www.chrismontgomery.info/)

[npm-url]: https://npmjs.org/package/load-common-gulp-tasks
[npm-image]: http://img.shields.io/npm/v/load-common-gulp-tasks.svg
[travis-image]: https://travis-ci.org/areusjs/load-common-gulp-tasks.svg?branch=master
[travis-url]: https://travis-ci.org/areusjs/load-common-gulp-tasks
