/* file : bloom-filter-test.js
MIT License

Copyright (c) 2017 Thomas Minier & Arnaud Grall

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

require('chai').should();
const { BloomFilter } = require('../dist/index.js');

describe('BloomFilter', () => {
  const targetRate = 0.1;

  describe('construction', () => {
    it('should add element to the filter with #add', () => {
      const filter = BloomFilter.create(15, targetRate);
      filter.add('alice');
      filter.add('bob');
      filter.length.should.equal(2);
    });

    it('should build a new filter using #from', () => {
      const data = ['alice', 'bob', 'carl'];
      const expectedSize = Math.ceil(
        -((data.length * Math.log(targetRate)) / Math.pow(Math.log(2), 2))
      );
      const expectedHashes = Math.ceil(
        (expectedSize / data.length) * Math.log(2)
      );
      const filter = BloomFilter.from(data, targetRate);
      filter.size.should.equal(expectedSize);
      filter._nbHashes.should.equal(expectedHashes);
      filter.length.should.equal(data.length);
      filter.rate().should.be.closeTo(targetRate, 0.1);
    });
  });

  describe('#has', () => {
    const filter = BloomFilter.from(['alice', 'bob', 'carl'], targetRate);
    it('should return false for elements that are definitively not in the set', () => {
      filter.has('daniel').should.equal(false);
      filter.has('al').should.equal(false);
    });

    it('should return true for elements that might be in the set', () => {
      filter.has('alice').should.equal(true);
      filter.has('bob').should.equal(true);
      filter.has('carl').should.equal(true);
    });
  });

  describe('#equals', () => {
    it('should returns True when two filters are equals', () => {
      const first = BloomFilter.from(['alice', 'bob', 'carol'], targetRate);
      const other = BloomFilter.from(['alice', 'bob', 'carol'], targetRate);
      first.equals(other).should.equal(true);
    });

    it('should returns False when two filters have different sizes', () => {
      const first = new BloomFilter(15, 4);
      const other = new BloomFilter(10, 4);
      first.equals(other).should.equal(false);
    });

    it('should returns False when two filters have different nb. of hash functions', () => {
      const first = new BloomFilter(15, 4);
      const other = new BloomFilter(15, 2);
      first.equals(other).should.equal(false);
    });

    it('should returns False when two filters have different content', () => {
      const first = BloomFilter.from(['alice', 'bob', 'carol'], targetRate);
      const other = BloomFilter.from(['alice', 'bob', 'daniel'], targetRate);
      first.equals(other).should.equal(false);
    });
  });

  describe('#export', () => {
    const filter = BloomFilter.from(['alice', 'bob', 'carl'], targetRate);
    it('should export a bloom filter to a Uint8Array', () => {
      const exported = filter.export();
      exported.length.should.equal(filter._filter.length + 3 * 8);
    });

    it('should create a bloom filter from a Uint8Array export', () => {
      const exported = filter.export();
      const newFilter = BloomFilter.import(exported);
      newFilter.size.should.equal(filter.size);
      newFilter.length.should.equal(filter.length);
      newFilter._nbHashes.should.equal(filter._nbHashes);
      newFilter._filter.should.deep.equal(filter._filter);
      newFilter.has('alice').should.equal(true);
      newFilter.has('bob').should.equal(true);
      newFilter.has('carl').should.equal(true);
    });
  });

  describe('Dangerous input test', () => {
    it('should not crash', () => {
      //This input used to crash the bloom filter due to an endless recursion
      const filter = new BloomFilter(39, 28, 78187493520);
      filter.add(
        'da5e21f8a67c4163f1a53ef43515bd027967da305ecfc741b2c3f40f832b7f82'
      );
      filter.length.should.equal(1);
    });
  });

  describe('Performance test', () => {
    const max = 1000;
    const targetedRate = 0.01;
    it(`should not return an error when inserting ${max} elements`, () => {
      const filter = BloomFilter.create(max, targetedRate);
      for (let i = 0; i < max; ++i) filter.add('' + i);
      for (let i = 0; i < max; ++i) {
        filter.has('' + i).should.equal(true);
      }
      let current;
      let falsePositive = 0;
      let tries = 0;
      for (let i = max; i < max * 11; ++i) {
        tries++;
        current = i;
        const has = filter.has('' + current, true);
        if (has) falsePositive++;
      }
      const currentrate = falsePositive / tries;
      currentrate.should.be.closeTo(targetedRate, targetedRate);
    });
  });
});
