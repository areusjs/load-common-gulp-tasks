var assert = require('assert');
var root = require('../lib/root');

describe('square', () => {

  it('should root a number correctly', () => {
    assert.equal(root(9), 3);
  });

});