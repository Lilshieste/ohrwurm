exports.isNthBitSet = (byte, n) => Boolean(byte & (1 << n));
exports.isOverflowBitSet = (carryIn, carryOut) => Boolean(carryIn ^ carryOut);
exports.isOverflow = (a, b, result) => Boolean((~(a ^ b)) & (a ^ result) & 0x80);
exports.isNegativeBitSet = (byte) => Boolean(byte & 0b10000000);
exports.isCarryBitSet = (byte) => Boolean(byte & 0b100000000);
exports.isZero = (byte) => byte === 0;
exports.toByte = (val) => val & 0xFF;
