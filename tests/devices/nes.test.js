const { createNES } = require('../../devices/nes');
const { createMockBus } = require('../mocks/bus');
const { createMockAPU } = require('../mocks/apu');

describe('NES System', () => {
  describe('peek', () => {
    it('should delegate to bus.read()', () => {
      const mockBus = createMockBus();
      mockBus.read.mockReturnValue(42);
      const system = createNES({ bus: mockBus });

      const result = system.peek(system.memory, 0x1234);

      expect(mockBus.read).toHaveBeenCalledWith(0x1234);
      expect(result).toBe(42);
    });
  });

  describe('poke', () => {
    it('should delegate to bus.write()', () => {
      const mockBus = createMockBus();
      const system = createNES({ bus: mockBus });

      system.poke(system.memory, 0x1234, 99);

      expect(mockBus.write).toHaveBeenCalledWith(0x1234, 99);
    });
  });

  describe('push', () => {
    it('should write to stack and decrement SP', () => {
      const mockBus = createMockBus();
      const system = createNES({ bus: mockBus });
      system.registers.SP = 0xFF;

      system.push(system.memory, system.registers, 0x42);

      expect(mockBus.write).toHaveBeenCalledWith(0x01FF, 0x42);
      expect(system.registers.SP).toBe(0xFE);
    });
  });

  describe('pull', () => {
    it('should increment SP and read from stack', () => {
      const mockBus = createMockBus();
      mockBus.read.mockReturnValue(0x42);
      const system = createNES({ bus: mockBus });
      system.registers.SP = 0xFE;

      const result = system.pull(system.memory, system.registers);

      expect(system.registers.SP).toBe(0xFF);
      expect(mockBus.read).toHaveBeenCalledWith(0x01FF);
      expect(result).toBe(0x42);
    });
  });

  describe('apu', () => {
    it('should expose the APU on the system', () => {
      const mockAPU = createMockAPU();
      const system = createNES({ apu: mockAPU });

      expect(system.apu).toBe(mockAPU);
    });
  });

  describe('registers', () => {
    it('should initialize CPU registers', () => {
      const system = createNES();

      expect(system.registers).toBeDefined();
      expect(system.registers.PC).toBeDefined();
      expect(system.registers.SP).toBeDefined();
      expect(system.registers.A).toBeDefined();
      expect(system.registers.X).toBeDefined();
      expect(system.registers.Y).toBeDefined();
    });
  });
});
