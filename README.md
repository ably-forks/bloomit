# `@ably/bloomit`

A fork of the bloomit package to fix a few issues (eg
https://github.com/kblauhut/bloomit/issues/4 ) and switch from xxhash to
farmhash.

Original readme follows below.

# bloomit

bloomit is a Space efficient bloom filter based on the
[bloom-filters npm package](https://www.npmjs.com/package/bloom-filters).

The main motivation for this package was to reduce the memory usage of the bloom
filter by using a bitmap instead of an array of javascript numbers. This should
result in a theoretical memory reduction by a factor of 64.

I have also edited the export to use a Uint8Array which encodes all needed
values and can be used to send it over the web efficiently.

#### Methods

- `add(element: string) -> void`: add an element into the filter.
- `has(element: string) -> boolean`: Test an element for membership, returning
  False if the element is definitively not in the filter and True is the element
  might be in the filter.
- `equals(other: BloomFilter) -> boolean`: Test if two filters are equals.
- `rate() -> number`: compute the filter's false positive rate (or error rate).
- `export() -> Uint8Array`: export the filter as an Uint8Array
- `inport(filterUint8Array: Uint8Array) -> BloomFilter`: Create a filter from a
  exporterd Uint8Array

```javascript
const { BloomFilter } = require('bloomit');
// create a Bloom Filter with a size of 10 and 4 hash functions
let filter = new BloomFilter(10, 4);
// insert data
filter.add('paul');
filter.add('kolja');
filter.add('carl');

// lookup for some data
console.log(filter.has('paul')); // output: true
console.log(filter.has('xiaomei')); // output: false

// print the error rate
console.log(filter.rate());

// alternatively, create a bloom filter optimal for a number of items and a desired error rate
const items = ['paul', 'kolja', 'carl'];
const errorRate = 0.04; // 4 % error rate
filter = BloomFilter.create(items.length, errorRate);

// or create a bloom filter optimal for a collections of items and a desired error rate
filter = BloomFilter.from(items, errorRate);

// Export the filter
const exportedFilter = filter.export();

// Import the filter
filter = BloomFilter.import(exportedFilter);
```
