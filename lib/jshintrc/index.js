var Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  _ = require('lodash');

module.exports = {
  /**
   *
   * @param defaultPath
   * @param customPath
   * @returns {Promise}
   */
  generate: function (defaultPath, customPath) {

    // http://james.padolsey.com/javascript/removing-comments-in-javascript/
    var commentRemovalRegex = /\/\*.+?\*\/|\/\/.*(?=[\n\r])/g;

    if (!customPath) {
      return fs.readFileAsync(defaultPath, 'utf8').then(function (data) {
        return fs.writeFileAsync('.tmp/.lint_jshintrc', data);
      });
    } else {
      return Promise.all([
        fs.readFileAsync(defaultPath, 'utf8'),
        fs.readFileAsync(customPath, 'utf8')
      ]).spread(function (defaultData, customData) {
        defaultData = defaultData.replace(commentRemovalRegex, '');
        customData = customData.replace(commentRemovalRegex, '');
        var jshintJSON = JSON.parse(defaultData);
        var customJSON = JSON.parse(customData);
        //console.log(defaultJSON, customJSON);
        _.merge(jshintJSON, customJSON, function (a, b) {
          return _.isArray(a) ? a.concat(b) : undefined;
        });
        return fs.writeFileAsync('.tmp/.lint_jshintrc', JSON.stringify(jshintJSON, null, 2));
      });
    }

    /*return fs.existsAsync('.tmp')
    .then(function (exists) {
      console.log('exists', exists);
      if (!exists) {
        return fs.mkdirAsync('./.tmp');
      }
      return Promise.resolve();
    }).catch(function (e) {
      console.log('ERROR!');
      console.error(e.stack);
      throw e;
    });*/
    /*.then(fs.readFileAsync(defaultPath))
    .then(function(data) {
      console.log(data);
      return fs.writeFileAsync('./.tmp/.lint_jshintrc', data);
    })*/

    /*fs.exists('.tmp', function(exists) {
      console.log('exists==>',exists);
    });*/

    /*return fs.existsAsync('.tmp');*/

    /*  fs.mkdir('./.tmp', function(err) {
        if (err) {
          throw err;
        }

        if (!customPath) {

          fs.readFile(defaultPath, function(err, data) {
            if (err) {
              throw err;
            }
            console.log(data);
            fs.writeFile('./.tmp/.lint_jshintrc', data, function(err) {
              if (err) {
                throw err;
              }
              //
            });
          });

        }

      });*/

  }
};