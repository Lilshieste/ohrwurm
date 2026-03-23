const { createPPUDevice } = require('../../systems/nes/ppu/ppu');

describe('PPU Device', () => {
  const ppu = createPPUDevice();

  describe('read/write', () => {
    it('should read and write to $2000-$2007', () => {
      ppu.write(0x2000, 42);
      ppu.write(0x2007, 99);

      expect(ppu.read(0x2000)).toBe(42);
      expect(ppu.read(0x2007)).toBe(99);
    });

    it('should initialize to zero', () => {
      const ppu = createPPUDevice();

      expect(ppu.read(0x2000)).toBe(0);
      expect(ppu.read(0x2007)).toBe(0);
    });
  });

  describe('mirroring', () => {
    it('should mirror $2000-$2007 every 8 bytes through $3FFF', () => {
      ppu.write(0x2000, 1);
      ppu.write(0x2007, 2);

      // Check a few mirror locations
      expect(ppu.read(0x2008)).toBe(1);
      expect(ppu.read(0x200F)).toBe(2);

      expect(ppu.read(0x2010)).toBe(1);
      expect(ppu.read(0x2017)).toBe(2);

      expect(ppu.read(0x3FF8)).toBe(1);
      expect(ppu.read(0x3FFF)).toBe(2);
    });

    it('should write to mirrored address and read from base', () => {
      ppu.write(0x2008, 10); // Mirror of $2000
      ppu.write(0x3FF8, 20); // Another mirror of $2000

      expect(ppu.read(0x2000)).toBe(20);
    });

    it('should mirror all 8 registers correctly', () => {
      for (let reg = 0; reg < 8; reg++) {
        ppu.write(0x2000 + reg, reg + 100);
      }

      // Verify each register can be read from multiple mirror locations
      for (let mirror = 0x2000; mirror <= 0x3FF8; mirror += 8) {
        for (let reg = 0; reg < 8; reg++) {
          expect(ppu.read(mirror + reg)).toBe(reg + 100);
        }
      }
    });
  });
});
