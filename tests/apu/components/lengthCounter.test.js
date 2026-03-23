const { createLengthCounter } = require('../../../systems/nes/apu/lengthCounter');

describe('Length Counter', () => {
  describe('load', () => {
    // https://www.nesdev.org/wiki/APU_Length_Counter
    const expectedLookupTable = [
      /* 00-0F */ 10, 254, 20, 2, 40,  4, 80,  6, 160,  8, 60, 10, 14, 12, 26, 14,
      /* 10-1F */ 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30
    ];
    
    it('should load value from lookup table using upper 5 bits', () => {
      const lc = createLengthCounter();

      // Index 0 (value >> 3 = 0) -> LENGTH_TABLE[0] = 10
      lc.load(0x00);
      expect(lc.getCounter()).toBe(10);

      // Index 1 (0x08 >> 3 = 1) -> LENGTH_TABLE[1] = 254
      lc.load(0x08);
      expect(lc.getCounter()).toBe(254);

      // Index 3 (0x18 >> 3 = 3) -> LENGTH_TABLE[3] = 2
      lc.load(0x18);
      expect(lc.getCounter()).toBe(2);

      // Index 31 (0xF8 >> 3 = 31) -> LENGTH_TABLE[31] = 30
      lc.load(0xF8);
      expect(lc.getCounter()).toBe(30);
    });

    it('should load values from documented lookup table using upper 5 bits', () => {
      const lc = createLengthCounter();

      expectedLookupTable.forEach((expected, index) => {
        lc.load(index << 3);
        expect(lc.getCounter()).toBe(expected);
      });
    });

    it('should load values from documented lookup table ignoring lower 3 bits', () => {
      const lc = createLengthCounter();

      expectedLookupTable.forEach((expected, index) => {
        // Test all 8 possible lower 3 bits (0-7)
        for (let lowerBits = 0; lowerBits < 8; lowerBits++) {
          const value = (index << 3) | lowerBits;
          lc.load(value);
          expect(lc.getCounter()).toBe(expected);
        }
      });
    });
  });

  describe('clock', () => {
    it('should decrement counter when not halted', () => {
      const lc = createLengthCounter();
      lc.load(0x18); // index 3 = 2

      expect(lc.getCounter()).toBe(2);

      lc.clock();
      expect(lc.getCounter()).toBe(1);

      lc.clock();
      expect(lc.getCounter()).toBe(0);
    });

    it('should not decrement below 0', () => {
      const lc = createLengthCounter();
      lc.load(0x18); // index 3 = 2

      lc.clock(); // 1
      lc.clock(); // 0
      lc.clock(); // still 0

      expect(lc.getCounter()).toBe(0);
    });

    it('should not decrement when halted', () => {
      const lc = createLengthCounter();
      lc.load(0x18); // index 3 = 2
      lc.setHalt(true);

      lc.clock();
      lc.clock();
      lc.clock();

      expect(lc.getCounter()).toBe(2);
    });

    it('should resume decrementing when halt is cleared', () => {
      const lc = createLengthCounter();
      lc.load(0x18); // index 3 = 2
      lc.setHalt(true);

      lc.clock(); // no effect
      expect(lc.getCounter()).toBe(2);

      lc.setHalt(false);
      lc.clock();
      expect(lc.getCounter()).toBe(1);
    });
  });

  describe('isActive', () => {
    it('should return true when counter > 0', () => {
      const lc = createLengthCounter();
      lc.load(0x08); // index 1 = 254
      expect(lc.isActive()).toBe(true);
    });

    it('should return false when counter is 0', () => {
      const lc = createLengthCounter();
      // Don't load anything, counter starts at 0
      expect(lc.isActive()).toBe(false);
    });
  });

  describe('isSilenced', () => {
    it('should return false when counter is active', () => {
      const lc = createLengthCounter();
      lc.load(0x08); // index 1 = 254
      expect(lc.isActive()).toBe(true);
      expect(lc.isSilenced()).toBe(false);
    });

    it('should return true when counter is not active', () => {
      const lc = createLengthCounter();
      // Don't load anything, counter starts at 0
      expect(lc.isActive()).toBe(false);
      expect(lc.isSilenced()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should set counter to 0', () => {
      const lc = createLengthCounter();
      lc.load(0x08); // index 1 = 254
      expect(lc.getCounter()).toBe(254);

      lc.clear();
      expect(lc.getCounter()).toBe(0);
    });
  });

  describe('length table values', () => {
    it('should have documented values', () => {
      const lc = createLengthCounter();

      // https://www.nesdev.org/wiki/APU_Length_Counter
      const expectedValues = [
        /* 00-0F */ 10, 254, 20, 2, 40,  4, 80,  6, 160,  8, 60, 10, 14, 12, 26, 14,
        /* 10-1F */ 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30
      ];

      expectedValues.forEach((expected, index) => {
        lc.load(index << 3);
        expect(lc.getCounter()).toBe(expected);
      });
    });
  });
});
