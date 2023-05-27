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
} = require('../../6502/memory');
const { createMemory, createRegisters, createSystem } = require('../../6502/state');

describe('Memory', () => {
  const system = createSystem();
  const memory = system.memory;

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

  describe('push', () => {
    afterEach(() => {
      system.registers = createRegisters();
    });

    it('should poke the specified value into the current address in the Stack Pointer', () => {
      const expected =  42;
      const startingSP = 0x22;

      system.registers.SP = startingSP;

      push(poke)(system.memory, system.registers, expected);
      expect(peek(system.memory, buildStackAddress(startingSP))).toBe(expected);
    });

    it('should use $FF as bottom of stack', () => {
      expect(system.registers.SP).toBe(0xFF);
      push(poke)(system.memory, system.registers, 42);
      expect(system.registers.SP).toBe(0xFE);
    });

    it('should rollover after $00 back to $FF', () => {
      system.registers.SP = 0x00;

      push(poke)(system.memory, system.registers, 42);
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

      const actual = pull(peek)(system.memory, system.registers);
      expect(actual).toBe(expected);
      expect(system.registers.SP).toBe(startingSP + 1);
    });

    it('should rollover after $FF back to $00', () => {
      system.registers.SP = 0xFF;

      pull(peek)(system.memory, system.registers);
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