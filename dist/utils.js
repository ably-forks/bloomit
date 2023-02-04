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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBitAtIndex = exports.setBitInByte = exports.getBitIndex = exports.getByteIndexInArray = exports.getUint8ArrayLength = exports.getDistinctIndices = exports.hashTwice = void 0;
const farmhash = __importStar(require("farmhash"));
const PRIME_STR = "'";
const PRIME_BUF = Buffer.from(PRIME_STR);
/**
 * (64-bits only) Hash a value into two values (in hex or integer format)
 * @param  value - The value to hash
 * @param  asInt - (optional) If True, the values will be returned as an integer. Otherwise, as hexadecimal values.
 * @return The results of the hash functions applied to the value (in hex or integer)
 * @memberof Utils
 * @author Arnaud Grall & Thomas Minier
 */
function hashTwice(value) {
    const hash64 = BigInt(farmhash.fingerprint64(value));
    const boundary = BigInt(2) ** BigInt(32);
    // take our hashes to be the top and bottom 32 bits of the 64-bit hash
    return {
        first: Number(hash64 / boundary),
        second: Number(hash64 % boundary),
    };
}
exports.hashTwice = hashTwice;
/**
 * Generate a set of distinct indexes on interval [0, size) using the double hashing technique
 * @param  element  - The element to hash
 * @param  size     - the range on which we can generate an index [0, size) = size
 * @param  number   - The number of indexes desired
 * @param  maxIterations - throw if we exceed this without finding a result of the
 * requested size; avoids a hard busy loop in the event of an algorithm failure. Defaults
 * to size*100
 * @return A array of indexes
 * @author Arnaud Grall, Simon Woolf
 */
function getDistinctIndices(element, size, number, maxIterations = size * 100) {
    let { first, second } = hashTwice(element);
    let index, i = 1;
    const indices = [];
    // Implements enhanced double hashing algorithm from
    // http://peterd.org/pcd-diss.pdf s.6.5.4
    while (indices.length < number) {
        index = first % size;
        if (!indices.includes(index)) {
            indices.push(index);
        }
        first = (first + second) % size;
        second = (second + i) % size;
        i++;
        if (i > size) {
            // Enhanced double hashing stops cycles of length less than `size` in the case where
            // size is coprime with the second hash. But you still get cycles of length `size`.
            // So if we reach there and haven't finished, append a prime to the input and
            // rehash.
            element = Buffer.isBuffer(element)
                ? Buffer.concat([element, PRIME_BUF])
                : element + PRIME_STR;
            ({ first, second } = hashTwice(element));
        }
        if (maxIterations && i > maxIterations) {
            throw new Error('max iterations exceeded');
        }
    }
    return indices;
}
exports.getDistinctIndices = getDistinctIndices;
/**
 * Return the amount of bytes needed to fit the input bits
 * @return Length of Unit8Array to use
 * @param bitCount    - amount of bits the filter uses
 */
function getUint8ArrayLength(bitCount) {
    const remainder = bitCount % 8;
    const bitFill = 8 - remainder;
    return (bitCount + bitFill) / 8;
}
exports.getUint8ArrayLength = getUint8ArrayLength;
/**
 * Return the index of the byte to be edited within the array
 * @return Array index of the byte to be edited
 * @param bitIndex    - index of the bit to be set
 * @author Kolja Blauhut
 */
function getByteIndexInArray(bitIndex) {
    return Math.floor(bitIndex / 8);
}
exports.getByteIndexInArray = getByteIndexInArray;
/**
 * Return the index of the bit in the byte to edit
 * @return Array index of the byte to be edited
 * @param bitIndex    - index of the bit to be set
 * @author Kolja Blauhut
 */
function getBitIndex(bitIndex) {
    return bitIndex % 8;
}
exports.getBitIndex = getBitIndex;
/**
 * Set a certain bit in the byte to 1
 * @return Edited byte
 * @param indexInByte     - Index of the bit in the byte to be set
 * @param byte            - Current byte
 * @author Kolja Blauhut
 */
function setBitInByte(indexInByte, byte) {
    const byteOR = 1 << indexInByte;
    return byte | byteOR;
}
exports.setBitInByte = setBitInByte;
/**
 * Returns a bit at a given index
 * @return Bit 1 | 0
 * @param array     - Uint8Array containing bloom filter
 * @param bitIndex  - Index of bit to read
 * @author Kolja Blauhut
 */
function getBitAtIndex(array, bitIndex) {
    const byte = array[getByteIndexInArray(bitIndex)];
    const indexInByte = getBitIndex(bitIndex);
    const byteAND = setBitInByte(indexInByte, 0);
    return ((byte & byteAND) >> indexInByte);
}
exports.getBitAtIndex = getBitAtIndex;
