const Util = require('../../6502/util');

describe('util', () => {
  test('isNthBitSet should return true if the bit at the Nth index is set', () => {
    expect(Util.isNthBitSet(0b0, 0)).toBe(false);
    expect(Util.isNthBitSet(0b0, 1)).toBe(false);
    expect(Util.isNthBitSet(0b1, 0)).toBe(true);
    expect(Util.isNthBitSet(0b1001, 3)).toBe(true);
    expect(Util.isNthBitSet(0b10000000, 7)).toBe(true);
  });

  test('isOverflow should return true only if signs do not line up with expectations', () => {
    expect(Util.isOverflow(0xff, 0x1fe, 0xff)).toBe(false);
    expect(Util.isOverflow(0xfe, 0x1fe, 0xff)).toBe(false);
    expect(Util.isOverflow(0x50, 0xbb, 0x6a)).toBe(true);
    expect(Util.isOverflow(0xbb, 0x14f, 0x94)).toBe(true);
    expect(Util.isOverflow(0x26, 0x8b, 0x64)).toBe(true);
  });

  test('isNegativeBitSet should return true only if bit 7 is set', () => {
    expect(Util.isNegativeBitSet(0b10000000)).toBe(true);
    expect(Util.isNegativeBitSet(0b01000000)).toBe(false);
    expect(Util.isNegativeBitSet(0b00100000)).toBe(false);
    expect(Util.isNegativeBitSet(0b00010000)).toBe(false);
    expect(Util.isNegativeBitSet(0b00001000)).toBe(false);
    expect(Util.isNegativeBitSet(0b00000100)).toBe(false);
    expect(Util.isNegativeBitSet(0b00000010)).toBe(false);
    expect(Util.isNegativeBitSet(0b00000001)).toBe(false);
  });

  test('isCarryBitSet should return true only if bit 8 is set', () => {
    expect(Util.isCarryBitSet(0b100000000)).toBe(true);
    expect(Util.isCarryBitSet(0b010000000)).toBe(false);
    expect(Util.isCarryBitSet(0b001000000)).toBe(false);
    expect(Util.isCarryBitSet(0b000100000)).toBe(false);
    expect(Util.isCarryBitSet(0b000010000)).toBe(false);
    expect(Util.isCarryBitSet(0b000001000)).toBe(false);
    expect(Util.isCarryBitSet(0b000000100)).toBe(false);
    expect(Util.isCarryBitSet(0b000000010)).toBe(false);
    expect(Util.isCarryBitSet(0b000000001)).toBe(false);
  });

  test('isZero should return true only if byte is 0', () => {
    expect(Util.isZero(0b100000000)).toBe(false);
    expect(Util.isZero(0b010001000)).toBe(false);
    expect(Util.isZero(0x0)).toBe(true);
    expect(Util.isZero(0b0000)).toBe(true);
  });

  test('toByte should return 1-byte portion of the specified value', () => {
    expect(Util.toByte(0x0)).toBe(0x0);
    expect(Util.toByte(0xF)).toBe(0xF);
    expect(Util.toByte(0xFF)).toBe(0xFF);
    expect(Util.toByte(0xFFF)).toBe(0xFF);
    expect(Util.toByte(0x12345)).toBe(0x45);
  });
});
