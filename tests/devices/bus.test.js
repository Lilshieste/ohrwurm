const { createBus } = require('../../devices/bus');
const { createMockDevice } = require('../mocks/device');

describe('Memory Bus', () => {
  const ram = createMockDevice();
  const ppu = createMockDevice();
  const apu = createMockDevice();
  const apuTestMode = createMockDevice();
  const cartridge = createMockDevice();
  const bus = createBus({ ram, ppu, apu, apuTestMode, cartridge });

  describe('for addresses within addressable range', () => {
    it('should route $0000-$1FFF to RAM', () => {
      bus.read(0x0000);
      bus.read(0x1FFF);
      bus.write(0x0800, 42);

      expect(ram.read).toHaveBeenCalledWith(0x0000);
      expect(ram.read).toHaveBeenCalledWith(0x1FFF);
      expect(ram.write).toHaveBeenCalledWith(0x0800, 42);
    });

    it('should route $2000-$3FFF to PPU', () => {
      bus.read(0x2000);
      bus.read(0x3FFF);
      bus.write(0x2007, 42);

      expect(ppu.read).toHaveBeenCalledWith(0x2000);
      expect(ppu.read).toHaveBeenCalledWith(0x3FFF);
      expect(ppu.write).toHaveBeenCalledWith(0x2007, 42);
    });

    it('should route $4000-$4017 to APU', () => {
      bus.read(0x4000);
      bus.read(0x4015);
      bus.read(0x4017);
      bus.write(0x4000, 42);

      expect(apu.read).toHaveBeenCalledWith(0x4000);
      expect(apu.read).toHaveBeenCalledWith(0x4015);
      expect(apu.read).toHaveBeenCalledWith(0x4017);
      expect(apu.write).toHaveBeenCalledWith(0x4000, 42);
    });

    it('should route $4018-$401F to APU Test Mode', () => {
      bus.read(0x4018);
      bus.read(0x401F);
      bus.write(0x4018, 42);

      expect(apuTestMode.read).toHaveBeenCalledWith(0x4018);
      expect(apuTestMode.read).toHaveBeenCalledWith(0x401F);
      expect(apuTestMode.write).toHaveBeenCalledWith(0x4018, 42);
    });

    it('should route $4020-$FFFF to Cartridge', () => {
      bus.read(0x4020);
      bus.read(0xFFFF);
      bus.write(0x8000, 42);

      expect(cartridge.read).toHaveBeenCalledWith(0x4020);
      expect(cartridge.read).toHaveBeenCalledWith(0xFFFF);
      expect(cartridge.write).toHaveBeenCalledWith(0x8000, 42);
    });
  });

  describe('for addresses outside of addressable range', () => {
    it('should throw on address below $0000', () => {
      expect(() => bus.read(-1)).toThrow();
    });

    it('should throw on address above $FFFF', () => {
      expect(() => bus.read(0x10000)).toThrow();
    });

    it('should throw on write to address below $0000', () => {
      expect(() => bus.write(-1, 0)).toThrow();
    });

    it('should throw on write to address above $FFFF', () => {
      expect(() => bus.write(0x10000, 0)).toThrow();
    });
  });
});
