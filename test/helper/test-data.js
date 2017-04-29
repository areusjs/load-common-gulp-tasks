var sinon = require('sinon');

module.exports = {
  gulpStub() {
    function noop() {
    }

    return sinon.stub({task: noop, tasks: {
      help: {},
      lint: {},
      'lint-show': {},
      felint: {},
      'felint-show': {},
      cover: {},
      test: {},
      default: {}
    }});
  }
};