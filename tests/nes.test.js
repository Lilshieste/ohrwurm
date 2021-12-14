const NES = require('../nes');
const { createSystem } = require('../system');
const { poke } = require('../memory');

describe('BR_Implied', () => {
  it('should set the break flag', () => {
    const system = createSystem();
    
    NES.INSTRUCTION_SET[0x00](system);

    expect(system.registers.B).toBe(true);
  });
});

describe('AND_Immediate', () => {
  it('should bitwise-AND the accumulator with the operand directly after the opcode', () => {
    const system = createSystem();
    const write = (address, value) => { poke(system, address,  value); };
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
    const write = (address, value) => { poke(system, address,  value); };
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
    const write = (address, value) => { poke(system, address,  value); };
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
    const write = (address, value) => { poke(system, address,  value); };
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
    const write = (address, value) => { poke(system, address,  value); };
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
    const write = (address, value) => { poke(system, address,  value); };
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

