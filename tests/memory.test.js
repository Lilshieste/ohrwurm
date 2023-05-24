const {
  buildAddress,
  buildStackAddress,
  buildStatusByte,
  loadBytes,
  loadStatusByte,
  peek,
  poke,
  pull,
  push,
  read,
  splitAddress,
} = require('../memory');
const { createMemory, createRegisters, createSystem } = require('../state');

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

  describe('buildAddress', () => {
    it('should return the sum of the shifted high bit and the low bit', () => {
      const low = 0x12;
      const high = 0x34;
      const expected = 0x3412;

      const actual = buildAddress(low, high);

      expect(actual).toBe(expected);
    });
  });

  describe('buildStackAddress', () => {
    it('should return $01xx where xx is the specified low bit ', () => {
      const low = 0x12;
      const expected = 0x0112;

      const actual = buildStackAddress(low);

      expect(actual).toBe(expected);
    });
  });

  describe('splitAddress', () => {
    it('should return the high and low bytes of the specified address', () => {
      const address = 0x1234;
      const expected = {
        highByte: 0x12,
        lowByte: 0x34,
      };

      const actual = splitAddress(address);

      expect(actual).toEqual(expected);
    });
  });

  describe('buildStatusByte', () => {
    const registers = createRegisters();

    beforeEach(() => {
      registers.B = false;
      registers.C = false;
      registers.D = false;
      registers.I = false;
      registers.N = false;
      registers.V = false;
      registers.Z = false;
    });

    it('should save (C)arry flag to bit 0', () => {
      registers.C = true;
      expect(buildStatusByte(registers)).toBe(0b00100001);
    });

    it('should save (Z)ero flag to bit 1', () => {
      registers.Z = true;
      expect(buildStatusByte(registers)).toBe(0b00100010);
    });

    it('should save (I)nterrupt flag to bit 2', () => {
      registers.I = true;
      expect(buildStatusByte(registers)).toBe(0b00100100);
    });

    it('should save (D)ecimal flag to bit 3', () => {
      registers.D = true;
      expect(buildStatusByte(registers)).toBe(0b00101000);
    });

    it('should save (B)reak flag to bit 4', () => {
      registers.B = true;
      expect(buildStatusByte(registers)).toBe(0b00110000);
    });

    it('should save o(V)erflow flag to bit 6', () => {
      registers.V = true;
      expect(buildStatusByte(registers)).toBe(0b01100000);
    });

    it('should save (N)egative flag to bit 7', () => {
      registers.N = true;
      expect(buildStatusByte(registers)).toBe(0b10100000);
    });
  });

  describe('loadStatusByte', () => {
    const registers = createRegisters();

    beforeEach(() => {
      registers.B = false;
      registers.C = false;
      registers.D = false;
      registers.I = false;
      registers.N = false;
      registers.V = false;
      registers.Z = false;
    });

    it('should set (C)arry flag based on bit 0', () => {
      loadStatusByte(registers, 0b00000001);
      expect(registers.C).toBe(true);
    });

    it('should set (Z)ero flag based on bit 1', () => {
      loadStatusByte(registers, 0b00000010);
      expect(registers.Z).toBe(true);
    });

    it('should set (I)nterrupt flag based on bit 2', () => {
      loadStatusByte(registers, 0b00000100);
      expect(registers.I).toBe(true);
    });

    it('should set (D)ecimal flag based on bit 3', () => {
      loadStatusByte(registers, 0b00001000);
      expect(registers.D).toBe(true);
    });

    it('should set (B)reak flag based on bit 4', () => {
      loadStatusByte(registers, 0b00010000);
      expect(registers.B).toBe(true);
    });

    it('should set o(V)erflow flag based on bit 6', () => {
      loadStatusByte(registers, 0b01000000);
      expect(registers.V).toBe(true);
    });

    it('should set (N)egative flag based on bit 7', () => {
      loadStatusByte(registers, 0b10000000);
      expect(registers.N).toBe(true);
    });
  });

  describe('peek', () => {
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

  describe('push', () => {
    afterEach(() => {
      for(let i = 0x0100; i <= 0x01FF; i++) {
        memory.RAM[i] = 0;
      }
      system.registers = createRegisters();
    });

    it('should poke the specified value into the current address in the Stack Pointer', () => {
      const expected =  42;
      const startingSP = 0x22;

      system.registers.SP = startingSP;

      push(system.memory, system.registers, expected);
      expect(peek(system.memory, buildStackAddress(startingSP))).toBe(expected);
    });

    it('should use $FF as bottom of stack', () => {
      expect(system.registers.SP).toBe(0xFF);
      push(system.memory, system.registers, 42);
      expect(system.registers.SP).toBe(0xFE);
    });

    it('should rollover after $00 back to $FF', () => {
      system.registers.SP = 0x00;

      push(system.memory, system.registers, 42);
      expect(system.registers.SP).toBe(0xFF);
    });
  });

  describe('pull', () => {
    afterEach(() => {
      for(let i = 0x0100; i <= 0x01FF; i++) {
        memory[i] = 0;
      }
      system.registers = createRegisters();
    });

    it('should return value at current stack pointer + 1 (since the stack pointer points to the next "available" space)', () => {
      const expected =  42;
      const startingSP = 0x22;

      system.registers.SP = startingSP;
      poke(system.memory, buildStackAddress(startingSP + 1), expected);

      const actual = pull(system.memory, system.registers);
      expect(actual).toBe(expected);
      expect(system.registers.SP).toBe(startingSP + 1);
    });

    it('should rollover after $FF back to $00', () => {
      system.registers.SP = 0xFF;

      pull(system.memory, system.registers);
      expect(system.registers.SP).toBe(0x00);
    });
  });

  describe('loadBytes', () => {
    it('should load the bytes sequentially into memory, starting with the specified address', () => {
      const memory = createMemory();
      const start = 0x42;
      const testBytes = [0x1, 0x2, 0x3, 0x4, 0x42, 0x43, 0x44, 0x0, 0x0, 0x45];

      loadBytes(memory, testBytes, start);

      for(let i = 0; i < testBytes.length; i++) {
        expect(peek(memory, start + i)).toBe(testBytes[i]);
      }
    });
  });

  describe('read', () => {
    const system = createSystem();

    it('should return the data pointed to by the Program Counter', () => {
      const PC = 0xface;
      const expected = 0x42;

      system.registers.PC = PC;
      poke(system.memory, PC, expected);
      const actual = read(system.memory, system.registers);

      expect(actual).toBe(expected);
    });

    it('should increment the Program Counter', () => {
      const expected = system.registers.PC + 1;

      read(system.memory, system.registers);

      expect(system.registers.PC).toBe(expected);
    });
  });
});