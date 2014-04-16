var through = require('through2');

/**
 * noop gulp-size replacement
 * @param options
 * @returns {*}
 */
module.exports = function(options) {
  return through.obj(function (file, enc, cb) {
    cb();
  }, function (cb) {
    cb();
  });
};