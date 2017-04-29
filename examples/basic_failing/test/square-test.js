var assert = require('assert');
var square = require('../lib/square');

describe('square', () => {

  it('should square a number correctly', () => {
    assert.equal(square(3), 9);
  });

});