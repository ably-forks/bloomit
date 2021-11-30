/* file : utils.ts
MIT License

Original bloom-filter implementation: Copyright (c) 2017-2020 Thomas Minier & Arnaud Grall

Bloomit changes: Copyright 2021 Kolja Blauhut

Ably-forks/bloomit changes: Copyright 2021 Simon Woolf

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

import * as farmhash from 'farmhash';

/**
 * Utilitaries functions
 * @namespace Utils
 * @private
 */

/* JSDOC typedef */
/**
 * @typedef {TwoHashes} Two hashes of the same value, as computed by {@link hashTwice}.
 * @property {number} first - The result of the first hashing function applied to a value
 * @property {number} second - The result of the second hashing function applied to a value
 * @memberof Utils
 */
interface TwoHashes {
  first: number;
  second: number;
}

export type HashableInput = string | Buffer;
export type Bit = 0 | 1;

/**
 * (64-bits only) Hash a value into two values (in hex or integer format)
 * @param  value - The value to hash
 * @param  asInt - (optional) If True, the values will be returned as an integer. Otherwise, as hexadecimal values.
 * @param seed the seed used for hashing
 * @return The results of the hash functions applied to the value (in hex or integer)
 * @memberof Utils
 * @author Arnaud Grall & Thomas Minier
 */
export function hashTwice(
  value: HashableInput
): TwoHashes {
  const hash64 = BigInt(farmhash.fingerprint64(value));
  const boundary = BigInt(2)**BigInt(32);
  // take our hashes to be the top and bottom 32 bits of the 64-bit hash
  return {
    first: Number(hash64 / boundary),
    second: Number(hash64 % boundary),
  };
}

/**
 * Apply Double Hashing to produce a n-hash
 *
 * This implementation used directly the value produced by the two hash functions instead of the functions themselves.
 * @see {@link http://citeseer.ist.psu.edu/viewdoc/download;jsessionid=4060353E67A356EF9528D2C57C064F5A?doi=10.1.1.152.579&rep=rep1&type=pdf} for more details about double hashing.
 * @param  n - The indice of the hash function we want to produce
 * @param  hashA - The result of the first hash function applied to a value.
 * @param  hashB - The result of the second hash function applied to a value.
 * @param  size - The size of the datastructures associated to the hash context (ex: the size of a Bloom Filter)
 * @return The result of hash_n applied to a value.
 * @memberof Utils
 * @author Thomas Minier
 */
export function doubleHashing(
  n: number,
  hashA: number,
  hashB: number,
  size: number
): number {
  // Cubic term avoids increased-probability-of-collision issue, see
  // http://peterd.org/pcd-diss.pdf s.6.5.4
  return Math.abs((hashA + n*hashB + Math.floor((n**3 - n)/6)) % size);
}

/**
 * Generate a set of distinct indexes on interval [0, size) using the double hashing technique
 * @param  element  - The element to hash
 * @param  size     - the range on which we can generate an index [0, size) = size
 * @param  number   - The number of indexes desired
 * @param  seed     - The seed used
 * @return A array of indexes
 * @author Arnaud Grall
 */
export function getDistinctIndices(
  element: HashableInput,
  size: number,
  number: number,
  seed?: number
): Array<number> {
  const {first, second} = hashTwice(element);
	const indices: Array<number> = [];
	let n = 0;
	while(indices.length < number) {
		const index = doubleHashing(n, first, second, size);
		if(!indices.includes(index)) {
			indices.push(index);
		}
		n++;
	}
	return indices;
}

/**
 * Return the amount of bytes needed to fit the input bits
 * @return Length of Unit8Array to use
 * @param bitCount    - amount of bits the filter uses
 */
export function getUint8ArrayLength(bitCount: number): number {
  const remainder = bitCount % 8;
  const bitFill = 8 - remainder;
  return (bitCount + bitFill) / 8;
}

/**
 * Return the index of the byte to be edited within the array
 * @return Array index of the byte to be edited
 * @param bitIndex    - index of the bit to be set
 * @author Kolja Blauhut
 */
export function getByteIndexInArray(bitIndex: number): number {
  return Math.floor(bitIndex / 8);
}

/**
 * Return the index of the bit in the byte to edit
 * @return Array index of the byte to be edited
 * @param bitIndex    - index of the bit to be set
 * @author Kolja Blauhut
 */
export function getBitIndex(bitIndex: number): number {
  return bitIndex % 8;
}

/**
 * Set a certain bit in the byte to 1
 * @return Edited byte
 * @param indexInByte     - Index of the bit in the byte to be set
 * @param byte            - Current byte
 * @author Kolja Blauhut
 */
export function setBitInByte(indexInByte: number, byte: number): number {
  const byteOR = 1 << indexInByte;
  return byte | byteOR;
}

/**
 * Returns a bit at a given index
 * @return Bit 1 | 0
 * @param array     - Uint8Array containing bloom filter
 * @param bitIndex  - Index of bit to read
 * @author Kolja Blauhut
 */
export function getBitAtIndex(array: Uint8Array, bitIndex: number): Bit {
  const byte = array[getByteIndexInArray(bitIndex)];
  const indexInByte = getBitIndex(bitIndex);
  const byteAND = setBitInByte(indexInByte, 0);
  return ((byte & byteAND) >> indexInByte) as Bit;
}
