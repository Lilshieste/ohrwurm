const { createNES } = require('../../devices/nes');

describe('Memory', () => {
  const system = createNES();
  const memory = system.memory;

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
  const STACK_START =  11;
  const STACK_END = 12;

  beforeEach(() => {
    memory.RAM[0] = RAM_START;
    memory.RAM[memory.RAM.length - 1] = RAM_END;
    memory.RAM[0x01FF] = STACK_START;
    memory.RAM[0x0100] = STACK_END;

    memory.PPU[0] = PPU_START;
    memory.PPU[memory.PPU.length - 1] = PPU_END;

    memory.APU[0] = APU_START;
    memory.APU[memory.APU.length - 1] = APU_END;

    memory.APUTestMode[0] = APU_TEST_MODE_START;
    memory.APUTestMode[memory.APUTestMode.length - 1] = APU_TEST_MODE_END;

    memory.Cartridge[0] = CARTRIDGE_START;
    memory.Cartridge[memory.Cartridge.length - 1] = CARTRIDGE_END;
  });

  describe('peek', () => {
    const peek = system.peekFn;

    it('should map $0000-$07FF to internal RAM', () => {
      expect(peek(memory, 0x0)).toBe(RAM_START);
      expect(peek(memory, 0x07FF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $0800-$0FFF', () => {
      expect(peek(memory, 0x0800)).toBe(RAM_START);
      expect(peek(memory, 0x0FFF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $1000-$17FF', () => {
      expect(peek(memory, 0x1000)).toBe(RAM_START);
      expect(peek(memory, 0x17FF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $1800-$1FFF', () => {
      expect(peek(memory, 0x1800)).toBe(RAM_START);
      expect(peek(memory, 0x1FFF)).toBe(RAM_END);
    });

    it('should designate second page of internal RAM ($0100-$01FF) as the stack', () => {
      expect(peek(memory, 0x01FF)).toBe(STACK_START);
      expect(peek(memory, 0x0100)).toBe(STACK_END);
    });
  
    it('should map $2000-$2007 to PPU', () => {
      expect(peek(memory, 0x2000)).toBe(PPU_START);
      expect(peek(memory, 0x2007)).toBe(PPU_END);
    });
  
    it('should mirror PPU to $2008-$3FFF (repeating every 8 bytes)', () => {
      for(let i = 0x2008; i <=0x3FFF; i += 8) {
        expect(peek(memory, i)).toBe(PPU_START);
        expect(peek(memory, i + 7)).toBe(PPU_END);
      }
    });
  
    it('should map $4000-$4017 to APU', () => {
      expect(peek(memory, 0x4000)).toBe(APU_START);
      expect(peek(memory, 0x4017)).toBe(APU_END);
    });
  
    it('should map $4018-$401F to APU Test Mode', () => {
      expect(peek(memory, 0x4018)).toBe(APU_TEST_MODE_START);
      expect(peek(memory, 0x401F)).toBe(APU_TEST_MODE_END);
    });
  
    it('should map $4020-$FFFF to Cartridge space', () => {
      expect(peek(memory, 0x4020)).toBe(CARTRIDGE_START);
      expect(peek(memory, 0xFFFF)).toBe(CARTRIDGE_END);
    });
  });

  describe('poke', () => {
    const poke = system.pokeFn;

    it('should map $0000-$07FF to internal RAM', () => {
      poke(memory, 0x0000, -RAM_START);
      poke(memory, 0x07FF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $0800-$0FFF', () => {
      poke(memory, 0x0800, -RAM_START);
      poke(memory, 0x0FFF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $1000-$17FF', () => {
      poke(memory, 0x1000, -RAM_START);
      poke(memory, 0x17FF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $1800-$1FFF', () => {
      poke(memory, 0x1800, -RAM_START);
      poke(memory, 0x1FFF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should map $2000-$2007 to PPU', () => {
      poke(memory, 0x2000, -PPU_START);
      poke(memory, 0x2007, -PPU_END);

      expect(memory.PPU[0]).toBe(-PPU_START);
      expect(memory.PPU[memory.PPU.length - 1]).toBe(-PPU_END);
    });
  
    it('should mirror PPU to $2008-$3FFF (repeating every 8 bytes)', () => {
      for(let i = 0x2008; i <=0x3FFF; i += 8) {
        poke(memory, i, -PPU_START);
        poke(memory, i + 7, -PPU_END);

        expect(memory.PPU[0]).toBe(-PPU_START);
        expect(memory.PPU[memory.PPU.length - 1]).toBe(-PPU_END);
      }
    });
  
    it('should map $4000-$4017 to APU', () => {
      poke(memory, 0x4000, -APU_START);
      poke(memory, 0x4017, -APU_END);

      expect(memory.APU[0]).toBe(-APU_START);
      expect(memory.APU[memory.APU.length - 1]).toBe(-APU_END);
    });
  
    it('should map $4018-$401F to APU Test Mode', () => {
      poke(memory, 0x4018, -APU_TEST_MODE_START);
      poke(memory, 0x401F, -APU_TEST_MODE_END);

      expect(memory.APUTestMode[0]).toBe(-APU_TEST_MODE_START);
      expect(memory.APUTestMode[memory.APUTestMode.length - 1]).toBe(-APU_TEST_MODE_END);
  
    });
  
    it('should map $4020-$FFFF to Cartridge space', () => {
      poke(memory, 0x4020, -CARTRIDGE_START);
      poke(memory, 0xFFFF, -CARTRIDGE_END);

      expect(memory.Cartridge[0]).toBe(-CARTRIDGE_START);
      expect(memory.Cartridge[memory.Cartridge.length - 1]).toBe(-CARTRIDGE_END);
    });
  });
});
