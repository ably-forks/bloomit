'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.int64ToUint8Array = exports.uint8ArrayToInt64 = exports.int32ToUint8Array = void 0;
const int32ToUint8Array = (n) => {
    const bytes = new Uint8Array(4);
    for (let index = 3; index >= 0; index -= 1) {
        bytes[index] = n & 0xff;
        n >>= 8;
    }
    return bytes;
};
exports.int32ToUint8Array = int32ToUint8Array;
const uint8ArrayToInt64 = (byteArray) => {
    let int64 = 0;
    for (const [index, byte] of byteArray.entries()) {
        int64 += byte * 2 ** (56 - index * 8);
    }
    return int64;
};
exports.uint8ArrayToInt64 = uint8ArrayToInt64;
const int64ToUint8Array = (n) => {
    const part1 = exports.int32ToUint8Array(n / 2 ** 32);
    const part2 = exports.int32ToUint8Array(n);
    const array = new Uint8Array(part1.length + part2.length);
    array.set(part1);
    array.set(part2, part1.length);
    return array;
};
exports.int64ToUint8Array = int64ToUint8Array;
