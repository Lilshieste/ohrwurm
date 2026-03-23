const { createAPUTestModeDevice } = require('../../devices/apuTestMode');

describe('APU Test Mode Device', () => {
  const apuTestMode = createAPUTestModeDevice();

  describe('read/write', () => {
    it('should read and write to $4018-$401F', () => {
      apuTestMode.write(0x4018, 42);
      apuTestMode.write(0x401F, 99);

      expect(apuTestMode.read(0x4018)).toBe(42);
      expect(apuTestMode.read(0x401F)).toBe(99);
    });

    it('should initialize to zero', () => {
      const apuTestMode = createAPUTestModeDevice();

      expect(apuTestMode.read(0x4018)).toBe(0);
      expect(apuTestMode.read(0x401F)).toBe(0);
    });

    it('should support all 8 registers', () => {
      for (let i = 0; i < 8; i++) {
        apuTestMode.write(0x4018 + i, i + 10);
      }

      for (let i = 0; i < 8; i++) {
        expect(apuTestMode.read(0x4018 + i)).toBe(i + 10);
      }
    });
  });
});
