var assert = require('assert');
var root = require('../lib/root');

describe('square', function () {

  it('should root a number correctly', function () {
    assert.equal(root(9), 3);
  });

});