const {
  peek,
  poke,
  pull,
  push,
} = require('../memory');
const { createSystem, createRegisters } = require('../system');

describe('Memory', () => {
  const system = createSystem();
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
    it('should map $0000-$07FF to internal RAM', () => {
      expect(peek(system, 0x0)).toBe(RAM_START);
      expect(peek(system, 0x07FF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $0800-$0FFF', () => {
      expect(peek(system, 0x0800)).toBe(RAM_START);
      expect(peek(system, 0x0FFF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $1000-$17FF', () => {
      expect(peek(system, 0x1000)).toBe(RAM_START);
      expect(peek(system, 0x17FF)).toBe(RAM_END);
    });
  
    it('should mirror internal RAM to $1800-$1FFF', () => {
      expect(peek(system, 0x1800)).toBe(RAM_START);
      expect(peek(system, 0x1FFF)).toBe(RAM_END);
    });

    it('should designate second page of internal RAM ($0100-$01FF) as the stack', () => {
      expect(peek(system, 0x01FF)).toBe(STACK_START);
      expect(peek(system, 0x0100)).toBe(STACK_END);
    });
  
    it('should map $2000-$2007 to PPU', () => {
      expect(peek(system, 0x2000)).toBe(PPU_START);
      expect(peek(system, 0x2007)).toBe(PPU_END);
    });
  
    it('should mirror PPU to $2008-$3FFF (repeating every 8 bytes)', () => {
      for(let i = 0x2008; i <=0x3FFF; i += 8) {
        expect(peek(system, i)).toBe(PPU_START);
        expect(peek(system, i + 7)).toBe(PPU_END);
      }
    });
  
    it('should map $4000-$4017 to APU', () => {
      expect(peek(system, 0x4000)).toBe(APU_START);
      expect(peek(system, 0x4017)).toBe(APU_END);
    });
  
    it('should map $4018-$401F to APU Test Mode', () => {
      expect(peek(system, 0x4018)).toBe(APU_TEST_MODE_START);
      expect(peek(system, 0x401F)).toBe(APU_TEST_MODE_END);
    });
  
    it('should map $4020-$FFFF to Cartridge space', () => {
      expect(peek(system, 0x4020)).toBe(CARTRIDGE_START);
      expect(peek(system, 0xFFFF)).toBe(CARTRIDGE_END);
    });
  });

  describe('poke', () => {
    it('should map $0000-$07FF to internal RAM', () => {
      poke(system, 0x0000, -RAM_START);
      poke(system, 0x07FF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $0800-$0FFF', () => {
      poke(system, 0x0800, -RAM_START);
      poke(system, 0x0FFF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $1000-$17FF', () => {
      poke(system, 0x1000, -RAM_START);
      poke(system, 0x17FF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should mirror internal RAM to $1800-$1FFF', () => {
      poke(system, 0x1800, -RAM_START);
      poke(system, 0x1FFF, -RAM_END);

      expect(memory.RAM[0]).toBe(-RAM_START);
      expect(memory.RAM[memory.RAM.length - 1]).toBe(-RAM_END);
    });
  
    it('should map $2000-$2007 to PPU', () => {
      poke(system, 0x2000, -PPU_START);
      poke(system, 0x2007, -PPU_END);

      expect(memory.PPU[0]).toBe(-PPU_START);
      expect(memory.PPU[memory.PPU.length - 1]).toBe(-PPU_END);
    });
  
    it('should mirror PPU to $2008-$3FFF (repeating every 8 bytes)', () => {
      for(let i = 0x2008; i <=0x3FFF; i += 8) {
        poke(system, i, -PPU_START);
        poke(system, i + 7, -PPU_END);

        expect(memory.PPU[0]).toBe(-PPU_START);
        expect(memory.PPU[memory.PPU.length - 1]).toBe(-PPU_END);
      }
    });
  
    it('should map $4000-$4017 to APU', () => {
      poke(system, 0x4000, -APU_START);
      poke(system, 0x4017, -APU_END);

      expect(memory.APU[0]).toBe(-APU_START);
      expect(memory.APU[memory.APU.length - 1]).toBe(-APU_END);
    });
  
    it('should map $4018-$401F to APU Test Mode', () => {
      poke(system, 0x4018, -APU_TEST_MODE_START);
      poke(system, 0x401F, -APU_TEST_MODE_END);

      expect(memory.APUTestMode[0]).toBe(-APU_TEST_MODE_START);
      expect(memory.APUTestMode[memory.APUTestMode.length - 1]).toBe(-APU_TEST_MODE_END);
  
    });
  
    it('should map $4020-$FFFF to Cartridge space', () => {
      poke(system, 0x4020, -CARTRIDGE_START);
      poke(system, 0xFFFF, -CARTRIDGE_END);

      expect(memory.Cartridge[0]).toBe(-CARTRIDGE_START);
      expect(memory.Cartridge[memory.Cartridge.length - 1]).toBe(-CARTRIDGE_END);
    });
  });

  describe('push', () => {
    afterEach(() => {
      for(let i = 0x0100; i <= 0x01FF; i++) {
        memory[i] = 0;
      }
      system.registers = createRegisters();
    });

    it('should use $01FF as bottom of stack', () => {
      expect(system.registers.SP).toBe(0x01FF);
      push(system, 42);
      expect(system.registers.SP).toBe(0x01FE);
    });

    it('should rollover after $0100 back to bottom of stack', () => {
      system.registers.SP = 0x0100;

      push(system, 42);
      expect(system.registers.SP).toBe(0x01FF);
    });
  });

  describe('pull', () => {
    afterEach(() => {
      for(let i = 0x0100; i <= 0x01FF; i++) {
        memory[i] = 0;
      }
      system.registers = createRegisters();
    });

    it('should return value at current stack pointer', () => {
      const expected =  42;
      const startingSP = 0x0122;

      system.registers.SP = startingSP;
      memory.RAM[startingSP] = expected;

      const actual = pull(system);
      expect(actual).toBe(expected);
      expect(system.registers.SP).toBe(startingSP + 1);
    });

    it('should rollover after $01FF back to top of stack', () => {
      system.registers.SP = 0x01FF;

      pull(system);
      expect(system.registers.SP).toBe(0x0100);
    });
  });
});