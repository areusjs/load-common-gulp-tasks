var through = require('through2');

/**
 * noop gulp-size replacement
 * @param options
 * @returns {*}
 */
module.exports = options => through.obj((file, enc, cb) => {
  cb();
}, cb => {
  cb();
});