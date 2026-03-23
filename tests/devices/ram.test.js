const { createRAMDevice } = require('../../systems/nes/ram');

describe('RAM Device', () => {
  const ram = createRAMDevice();

  describe('for addresses in base range', () => {
    it('should read and write to $0000-$07FF', () => {
      ram.write(0x0000, 42);
      ram.write(0x07FF, 99);

      expect(ram.read(0x0000)).toBe(42);
      expect(ram.read(0x07FF)).toBe(99);
    });

    it('should initialize to zero', () => {
      const ram = createRAMDevice();

      expect(ram.read(0x0000)).toBe(0);
      expect(ram.read(0x07FF)).toBe(0);
    });
  });

  describe('for addresses in mirror range', () => {
    it('should mirror $0000-$07FF to $0800-$0FFF', () => {
      ram.write(0x0000, 1);
      ram.write(0x07FF, 2);

      expect(ram.read(0x0800)).toBe(1);
      expect(ram.read(0x0FFF)).toBe(2);
    });

    it('should mirror $0000-$07FF to $1000-$17FF', () => {
      ram.write(0x0000, 3);
      ram.write(0x07FF, 4);

      expect(ram.read(0x1000)).toBe(3);
      expect(ram.read(0x17FF)).toBe(4);
    });

    it('should mirror $0000-$07FF to $1800-$1FFF', () => {
      ram.write(0x0000, 5);
      ram.write(0x07FF, 6);

      expect(ram.read(0x1800)).toBe(5);
      expect(ram.read(0x1FFF)).toBe(6);
    });

    it('should write to mirrored address and read from base', () => {
      ram.write(0x0800, 10);
      ram.write(0x1000, 20);
      ram.write(0x1800, 30);

      // All writes should affect the same physical location
      expect(ram.read(0x0000)).toBe(30);
    });
  });
});
