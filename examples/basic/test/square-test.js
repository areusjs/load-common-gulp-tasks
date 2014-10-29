var assert = require('assert');
var square = require('../lib/square');

describe('square', function () {

  it('should square a number correctly', function () {
    assert.equal(square(3), 9);
  });

});