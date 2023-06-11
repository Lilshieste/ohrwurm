const isNegative = (byte) => Boolean(byte & 0b10000000);

exports.isCarryBitSet = (byte) => Boolean(byte & 0b100000000);
exports.isNegativeBitSet = isNegative;
exports.isNthBitSet = (byte, n) => Boolean(byte & (1 << n));
exports.isOverflow = (original, result, operand) => isNegative(original ^ operand) !== isNegative(original ^ result);
exports.isZero = (byte) => byte === 0;
exports.onesComplement = (byte) => byte ^ 0xff;
exports.toByte = (val) => val & 0xFF;
