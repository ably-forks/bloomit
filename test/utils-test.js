'use strict';

require('chai').should();
const Utils = require('../dist/utils.js');

describe('getDistinctIndices', () => {
  it('should take a reasonable number of iterations with pathological inputs', () => {
    // construct inputs which make it quite likely that h_2 is coprime with the size, we
    // should not get into a loop
    const size = 7;
    const numIndexes = 7;
    const maxIterations = 100;
    for(let i=0; i<1000; i++) {
      Utils.getDistinctIndices(i.toString(), size, numIndexes, maxIterations);
    }
  });
});
