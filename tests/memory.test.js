const {
  readFromMemory,
  writeToMemory,
} = require('../memory');
const { createMemory } = require('../system');

describe('Memory', () => {
  const memory = createMemory();
  const read = readFromMemory(memory);
  const write = writeToMemory(memory);

  const RAM_START = 1;
  const RAM_END = 2;
  const PPU_START = 3;
  const PPU_END = 4;
  const APU_START = 5;
  const APU_END = 6;
  const APU_TEST_MODE_START = 7;
  const APU_TEST_MODE_END = 8;
  const CARTRIDGE_START = 9;
  const CARTRIDGE_END = 10;

  beforeEach(() => {
    memory.RAM[0] = RAM_START;
    memory.RAM[memory.RAM.length - 1] = RAM_END;

    memory.PPU[0] = PPU_START;
    memory.PPU[memory.PPU.length - 1] = PPU_END;

    memory.APU[0] = APU_START;
    memory.APU[memory.APU.length - 1] = APU_END;

    memory.APUTestMode[0] = APU_TEST_MODE_START;
    memory.APUTestMode[memory.APUTestMode.length - 1] = APU_TEST_MODE_END;

    memory.Cartridge[0] = CARTRIDGE_START;
    memory.Cartridge[memory.Cartridge.length - 1] = CARTRIDGE_END;
  });

  describe('read', () => {
    it('should map $0000-$07FF to internal RAM', () => {
      expect(read(0x0)).toBe(RAM_START);
      expect(read(0x07FF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $0800-$0FFF', () => {
      expect(read(0x0800)).toBe(RAM_START);
      expect(read(0x0FFF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $1000-$17FF', () => {
      expect(read(0x1000)).toBe(RAM_START);
      expect(read(0x17FF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $1800-$1FFF', () => {
      expect(read(0x1800)).toBe(RAM_START);
      expect(read(0x1FFF)).toBe(RAM_END);
    });
  
    it('should map $2000-$2007 to PPU', () => {
      expect(read(0x2000)).toBe(PPU_START);
      expect(read(0x2007)).toBe(PPU_END);
    });
  
    it('should mirror PPU to $2008-$3FFF (repeating every 8 bytes)', () => {
      for(let i = 0x2008; i <=0x3FFF; i += 8) {
        expect(read(i)).toBe(PPU_START);
        expect(read(i + 7)).toBe(PPU_END);
      }
    });
  
    it('should map $4000-$4017 to APU', () => {
      expect(read(0x4000)).toBe(APU_START);
      expect(read(0x4017)).toBe(APU_END);
    });
  
    it('should map $4018-$401F to APU Test Mode', () => {
      expect(read(0x4018)).toBe(APU_TEST_MODE_START);
      expect(read(0x401F)).toBe(APU_TEST_MODE_END);
    });
  
    it('should map $4020-$FFFF to Cartridge space', () => {
      expect(read(0x4020)).toBe(CARTRIDGE_START);
      expect(read(0xFFFF)).toBe(CARTRIDGE_END);
    });
  });

  describe('write', () => {
    it('should map $0000-$07FF to internal RAM', () => {
      write(0x0000, -RAM_START);
      write(0x07FF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $0800-$0FFF', () => {
      write(0x0800, -RAM_START);
      write(0x0FFF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $1000-$17FF', () => {
      write(0x1000, -RAM_START);
      write(0x17FF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $1800-$1FFF', () => {
      write(0x1800, -RAM_START);
      write(0x1FFF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should map $2000-$2007 to PPU', () => {
      write(0x2000, -PPU_START);
      write(0x2007, -PPU_END);

      expect(memory.PPU[0]).toBe(-PPU_START);
      expect(memory.PPU[memory.PPU.length - 1]).toBe(-PPU_END);
    });
  
    it('should mirror PPU to $2008-$3FFF (repeating every 8 bytes)', () => {
      for(let i = 0x2008; i <=0x3FFF; i += 8) {
        write(i, -PPU_START);
        write(i + 7, -PPU_END);

        expect(memory.PPU[0]).toBe(-PPU_START);
        expect(memory.PPU[memory.PPU.length - 1]).toBe(-PPU_END);
      }
    });
  
    it('should map $4000-$4017 to APU', () => {
      write(0x4000, -APU_START);
      write(0x4017, -APU_END);

      expect(memory.APU[0]).toBe(-APU_START);
      expect(memory.APU[memory.APU.length - 1]).toBe(-APU_END);
    });
  
    it('should map $4018-$401F to APU Test Mode', () => {
      write(0x4018, -APU_TEST_MODE_START);
      write(0x401F, -APU_TEST_MODE_END);

      expect(memory.APUTestMode[0]).toBe(-APU_TEST_MODE_START);
      expect(memory.APUTestMode[memory.APUTestMode.length - 1]).toBe(-APU_TEST_MODE_END);
  
    });
  
    it('should map $4020-$FFFF to Cartridge space', () => {
      write(0x4020, -CARTRIDGE_START);
      write(0xFFFF, -CARTRIDGE_END);

      expect(memory.Cartridge[0]).toBe(-CARTRIDGE_START);
      expect(memory.Cartridge[memory.Cartridge.length - 1]).toBe(-CARTRIDGE_END);
    });
  });
});