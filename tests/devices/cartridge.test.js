const { createCartridgeDevice } = require('../../devices/cartridge');

describe('Cartridge Device', () => {
  const cartridge = createCartridgeDevice();

  describe('read/write', () => {
    it('should read and write to $4020-$FFFF', () => {
      cartridge.write(0x4020, 42);
      cartridge.write(0xFFFF, 99);

      expect(cartridge.read(0x4020)).toBe(42);
      expect(cartridge.read(0xFFFF)).toBe(99);
    });

    it('should initialize to zero', () => {
      const cartridge = createCartridgeDevice();

      expect(cartridge.read(0x4020)).toBe(0);
      expect(cartridge.read(0xFFFF)).toBe(0);
    });

    it('should support PRG ROM area ($8000-$FFFF)', () => {
      cartridge.write(0x8000, 0xEA); // NOP opcode
      cartridge.write(0xC000, 0x4C); // JMP opcode

      expect(cartridge.read(0x8000)).toBe(0xEA);
      expect(cartridge.read(0xC000)).toBe(0x4C);
    });

    it('should support reset vector at $FFFC-$FFFD', () => {
      cartridge.write(0xFFFC, 0x00); // Low byte
      cartridge.write(0xFFFD, 0x80); // High byte -> $8000

      expect(cartridge.read(0xFFFC)).toBe(0x00);
      expect(cartridge.read(0xFFFD)).toBe(0x80);
    });
  });
});
