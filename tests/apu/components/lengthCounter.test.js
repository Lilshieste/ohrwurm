const { createLengthCounter } = require('../../../apu/components/lengthCounter');

describe('Length Counter', () => {
  describe('load', () => {
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

    it('should ignore lower 3 bits', () => {
      const lc = createLengthCounter();

      // All these should load index 0 -> 10
      lc.load(0x00);
      expect(lc.getCounter()).toBe(10);

      lc.load(0x01);
      expect(lc.getCounter()).toBe(10);

      lc.load(0x07);
      expect(lc.getCounter()).toBe(10);
    });
  });

  describe('clock', () => {
    it('should decrement counter when not halted', () => {
      const lc = createLengthCounter();
      lc.load(0x18); // index 3 = 2

      expect(lc.getCounter()).toBe(2);
      expect(lc.isActive()).toBe(true);

      lc.clock();
      expect(lc.getCounter()).toBe(1);
      expect(lc.isActive()).toBe(true);

      lc.clock();
      expect(lc.getCounter()).toBe(0);
      expect(lc.isActive()).toBe(false);
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
      expect(lc.isActive()).toBe(true);
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

  describe('clear', () => {
    it('should set counter to 0', () => {
      const lc = createLengthCounter();
      lc.load(0x08); // index 1 = 254
      expect(lc.getCounter()).toBe(254);

      lc.clear();
      expect(lc.getCounter()).toBe(0);
      expect(lc.isActive()).toBe(false);
    });
  });

  describe('length table values', () => {
    it('should have correct values for common indices', () => {
      const lc = createLengthCounter();

      // Test a few key values from the table
      const expectedValues = [
        [0, 10],   // index 0
        [1, 254],  // index 1
        [2, 20],   // index 2
        [3, 2],    // index 3
        [4, 40],   // index 4
        [10, 60],  // index 10
        [20, 48],  // index 20
        [30, 32],  // index 30
        [31, 30],  // index 31
      ];

      for (const [index, expected] of expectedValues) {
        lc.load(index << 3);
        expect(lc.getCounter()).toBe(expected);
      }
    });
  });
});
