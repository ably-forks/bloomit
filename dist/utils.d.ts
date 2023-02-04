/// <reference types="node" />
/**
 * Utilitaries functions
 * @namespace Utils
 * @private
 */
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
export declare type HashableInput = string | Buffer;
export declare type Bit = 0 | 1;
/**
 * (64-bits only) Hash a value into two values (in hex or integer format)
 * @param  value - The value to hash
 * @param  asInt - (optional) If True, the values will be returned as an integer. Otherwise, as hexadecimal values.
 * @return The results of the hash functions applied to the value (in hex or integer)
 * @memberof Utils
 * @author Arnaud Grall & Thomas Minier
 */
export declare function hashTwice(value: HashableInput): TwoHashes;
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
export declare function getDistinctIndices(element: HashableInput, size: number, number: number, maxIterations?: number): Array<number>;
/**
 * Return the amount of bytes needed to fit the input bits
 * @return Length of Unit8Array to use
 * @param bitCount    - amount of bits the filter uses
 */
export declare function getUint8ArrayLength(bitCount: number): number;
/**
 * Return the index of the byte to be edited within the array
 * @return Array index of the byte to be edited
 * @param bitIndex    - index of the bit to be set
 * @author Kolja Blauhut
 */
export declare function getByteIndexInArray(bitIndex: number): number;
/**
 * Return the index of the bit in the byte to edit
 * @return Array index of the byte to be edited
 * @param bitIndex    - index of the bit to be set
 * @author Kolja Blauhut
 */
export declare function getBitIndex(bitIndex: number): number;
/**
 * Set a certain bit in the byte to 1
 * @return Edited byte
 * @param indexInByte     - Index of the bit in the byte to be set
 * @param byte            - Current byte
 * @author Kolja Blauhut
 */
export declare function setBitInByte(indexInByte: number, byte: number): number;
/**
 * Returns a bit at a given index
 * @return Bit 1 | 0
 * @param array     - Uint8Array containing bloom filter
 * @param bitIndex  - Index of bit to read
 * @author Kolja Blauhut
 */
export declare function getBitAtIndex(array: Uint8Array, bitIndex: number): Bit;
export {};
