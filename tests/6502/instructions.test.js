const NES = require('../../6502/instructions');
const { createSystem } = require('../../6502/state');
const { peek, poke } = require('../../6502/memory');

describe('Instructions', () => {
  NES.INSTRUCTION_SET = NES.createInstructionSet();

  describe('AND_Immediate', () => {
    it('should bitwise-AND the accumulator with the operand directly after the opcode', () => {
      const system = createSystem();
      const write = (address, value) => { poke(system.memory, address,  value); };
      const initialPC = 0x8000;
      const initialA = 0b11110000;
      const operand1 = 0b10100000;
      const operand2 = 0b00000000;
  
      system.registers.A = initialA;
      system.registers.PC = initialPC;
      write(initialPC, operand1);
      write(initialPC + 1, operand2);
      
      NES.INSTRUCTION_SET[0x29](system);
      expect(system.registers.A).toBe(initialA & operand1);
      expect(system.registers.N).toBe(true);
      expect(system.registers.Z).toBe(false);
      expect(system.registers.PC).toBe(initialPC + 1);
  
      NES.INSTRUCTION_SET[0x29](system);
      expect(system.registers.A).toBe(initialA & operand1 & operand2);
      expect(system.registers.N).toBe(false);
      expect(system.registers.Z).toBe(true);
      expect(system.registers.PC).toBe(initialPC + 2);
    });
  });
  
  describe('AND_Absolute', () => {
    it('should bitwise-AND the accumulator with the operand at the specified address', () => {
      const system = createSystem();
      const write = (address, value) => { poke(system.memory, address,  value); };
      const initialPC = 0x8000;
      const initialA = 0b11110000;
      const operand = 0b10100000;
      const lowByte = 0x04;
      const highByte = 0x42;
  
      system.registers.A = initialA;
      system.registers.PC = initialPC;
      write(initialPC, lowByte);
      write(initialPC + 1, highByte);
      write((highByte << 8) + lowByte, operand);
      
      NES.INSTRUCTION_SET[0x2d](system);
      expect(system.registers.A).toBe(initialA & operand);
      expect(system.registers.N).toBe(true);
      expect(system.registers.Z).toBe(false);
      expect(system.registers.PC).toBe(initialPC + 2);
    });
  });
  
  describe('AND_AbsoluteX', () => {
    it('should bitwise-AND the accumulator with the operand at the specified address with the offset specified in register X', () => {
      const system = createSystem();
      const write = (address, value) => { poke(system.memory, address,  value); };
      const initialPC = 0x8000;
      const initialA = 0b11110000;
      const operand = 0b10100000;
      const lowByte = 0x04;
      const highByte = 0x42;
      const offset = 42;
  
      system.registers.A = initialA;
      system.registers.X = offset;
      system.registers.PC = initialPC;
      write(initialPC, lowByte);
      write(initialPC + 1, highByte);
      write((highByte << 8) + lowByte + offset, operand);
      
      NES.INSTRUCTION_SET[0x3d](system);
      expect(system.registers.A).toBe(initialA & operand);
      expect(system.registers.N).toBe(true);
      expect(system.registers.Z).toBe(false);
      expect(system.registers.PC).toBe(initialPC + 2);
    });
  });
  
  describe('AND_AbsoluteY', () => {
    it('should bitwise-AND the accumulator with the operand at the specified address with the offset specified in register Y', () => {
      const system = createSystem();
      const write = (address, value) => { poke(system.memory, address,  value); };
      const initialPC = 0x8000;
      const initialA = 0b11110000;
      const operand = 0b10100000;
      const lowByte = 0x04;
      const highByte = 0x42;
      const offset = 42;
  
      system.registers.A = initialA;
      system.registers.Y = offset;
      system.registers.PC = initialPC;
      write(initialPC, lowByte);
      write(initialPC + 1, highByte);
      write((highByte << 8) + lowByte + offset, operand);
      
      NES.INSTRUCTION_SET[0x39](system);
      expect(system.registers.A).toBe(initialA & operand);
      expect(system.registers.N).toBe(true);
      expect(system.registers.Z).toBe(false);
      expect(system.registers.PC).toBe(initialPC + 2);
    });
  });
  
  describe('AND_ZeroPage', () => {
    it('should bitwise-AND the accumulator with the operand at the specified zero page address', () => {
      const system = createSystem();
      const write = (address, value) => { poke(system.memory, address,  value); };
      const initialPC = 0x8000;
      const initialA = 0b11110000;
      const operand = 0b10100000;
      const address = 0x04;
  
      system.registers.A = initialA;
      system.registers.PC = initialPC;
      write(initialPC, address);
      write(address, operand);
      
      NES.INSTRUCTION_SET[0x25](system);
      expect(system.registers.A).toBe(initialA & operand);
      expect(system.registers.N).toBe(true);
      expect(system.registers.Z).toBe(false);
      expect(system.registers.PC).toBe(initialPC + 1);
    });
  });
  
  describe('AND_ZeroPageX', () => {
    it('should bitwise-AND the accumulator with the operand at the specified zero page address with the offset specified in register X', () => {
      const system = createSystem();
      const write = (address, value) => { poke(system.memory, address,  value); };
      const initialPC = 0x8000;
      const initialA = 0b11110000;
      const operand = 0b10100000;
      const address = 0x04;
      const offset = 42;
  
      system.registers.A = initialA;
      system.registers.X = offset;
      system.registers.PC = initialPC;
      write(initialPC, address);
      write(address + offset, operand);
      
      NES.INSTRUCTION_SET[0x35](system);
      expect(system.registers.A).toBe(initialA & operand);
      expect(system.registers.N).toBe(true);
      expect(system.registers.Z).toBe(false);
      expect(system.registers.PC).toBe(initialPC + 1);
    });
  });
  
  describe('Simple program', () => {
    it('should have the right final state', () => {
      const system = createSystem();
  
      poke(system.memory, 0x0600, 0xa9);
      poke(system.memory, 0x0601, 0x01);
      poke(system.memory, 0x0602, 0x8d);
      poke(system.memory, 0x0603, 0x00);
      poke(system.memory, 0x0604, 0x02);
      poke(system.memory, 0x0605, 0xa9);
      poke(system.memory, 0x0606, 0x05);
      poke(system.memory, 0x0607, 0x8d);
      poke(system.memory, 0x0608, 0x01);
      poke(system.memory, 0x0609, 0x02);
      poke(system.memory, 0x060a, 0xa9);
      poke(system.memory, 0x060b, 0x08);
      poke(system.memory, 0x060c, 0x8d);
      poke(system.memory, 0x060d, 0x02);
      poke(system.memory, 0x060e, 0x02);
  
      system.registers.PC = 0x0600;
      system.registers.PC++; NES.INSTRUCTION_SET[0xa9](system);
      system.registers.PC++; NES.INSTRUCTION_SET[0x8d](system);
      system.registers.PC++; NES.INSTRUCTION_SET[0xa9](system);
      system.registers.PC++; NES.INSTRUCTION_SET[0x8d](system);
      system.registers.PC++; NES.INSTRUCTION_SET[0xa9](system);
      system.registers.PC++; NES.INSTRUCTION_SET[0x8d](system);
  
      const expected = {
        A: 8,
        X: 0,
        Y: 0,
        PC: 0x060f,
        SP: 255,
        N: false,
        V: false,
        B: false,
        D: false,
        I: false,
        Z: false,
        C: false,
      };
  
      expect(system.registers).toEqual(expected);
    });
  });
});
