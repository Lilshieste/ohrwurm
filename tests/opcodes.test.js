const OpCodes = require('../opcodes');
const { createSystem } = require('../system');
const { writeToMemory } = require('../memory');

const direct = (operand) => () => operand;

describe('BR', () => {
  it('should set the break flag', () => {
    const system = createSystem();
    
    OpCodes.BR(system);

    expect(system.cpu.B).toBe(true);
  });
});

describe('AND', () => {
  it('should set (N)egative flag properly after bitwise-AND', () => {
    const system = createSystem();
    const write = writeToMemory(system.memory);
    const initialPC = 0x8000;
    const initialA = 0b11110000;
    const operand = 0b10100000;
    system.cpu.A = initialA;
    system.cpu.PC = initialPC;
    write(initialPC, operand);
    
    OpCodes.AND(direct(operand))(system);
    expect(system.cpu.A).toBe(initialA & operand);
    expect(system.cpu.N).toBe(true);
    expect(system.cpu.Z).toBe(false);
  });

  it('should set (Z)ero flag properly after bitwise-AND', () => {
    const system = createSystem();
    const write = writeToMemory(system.memory);
    const initialPC = 0x8000;
    const initialA = 0b11110000;
    const operand = 0b00000000;

    system.cpu.A = initialA;
    system.cpu.PC = initialPC;
    write(initialPC, operand);
    
    OpCodes.AND(direct(operand))(system);
    expect(system.cpu.A).toBe(initialA & operand);
    expect(system.cpu.N).toBe(false);
    expect(system.cpu.Z).toBe(true);
  });
});

// describe('AND_Absolute', () => {
//   it('should bitwise-AND the accumulator with the operand at the specified address', () => {
//     const system = createSystem();
//     const write = writeToMemory(system.memory);
//     const initialPC = 0x8000;
//     const initialA = 0b11110000;
//     const operand = 0b10100000;
//     const lowByte = 0x04;
//     const highByte = 0x42;

//     system.cpu.A = initialA;
//     system.cpu.PC = initialPC;
//     write(initialPC, lowByte);
//     write(initialPC + 1, highByte);
//     write((highByte << 8) + lowByte, operand);
    
//     OpCodes.AND_Absolute(system);
//     expect(system.cpu.A).toBe(initialA & operand);
//     expect(system.cpu.N).toBe(true);
//     expect(system.cpu.Z).toBe(false);
//     expect(system.cpu.PC).toBe(initialPC + 2);
//   });
// });

// describe('AND_AbsoluteX', () => {
//   it('should bitwise-AND the accumulator with the operand at the specified address with the offset specified in register X', () => {
//     const system = createSystem();
//     const write = writeToMemory(system.memory);
//     const initialPC = 0x8000;
//     const initialA = 0b11110000;
//     const operand = 0b10100000;
//     const lowByte = 0x04;
//     const highByte = 0x42;
//     const offset = 42;

//     system.cpu.A = initialA;
//     system.cpu.X = offset;
//     system.cpu.PC = initialPC;
//     write(initialPC, lowByte);
//     write(initialPC + 1, highByte);
//     write((highByte << 8) + lowByte + offset, operand);
    
//     OpCodes.AND_AbsoluteX(system);
//     expect(system.cpu.A).toBe(initialA & operand);
//     expect(system.cpu.N).toBe(true);
//     expect(system.cpu.Z).toBe(false);
//     expect(system.cpu.PC).toBe(initialPC + 2);
//   });
// });

// describe('AND_AbsoluteY', () => {
//   it('should bitwise-AND the accumulator with the operand at the specified address with the offset specified in register Y', () => {
//     const system = createSystem();
//     const write = writeToMemory(system.memory);
//     const initialPC = 0x8000;
//     const initialA = 0b11110000;
//     const operand = 0b10100000;
//     const lowByte = 0x04;
//     const highByte = 0x42;
//     const offset = 42;

//     system.cpu.A = initialA;
//     system.cpu.Y = offset;
//     system.cpu.PC = initialPC;
//     write(initialPC, lowByte);
//     write(initialPC + 1, highByte);
//     write((highByte << 8) + lowByte + offset, operand);
    
//     OpCodes.AND_AbsoluteY(system);
//     expect(system.cpu.A).toBe(initialA & operand);
//     expect(system.cpu.N).toBe(true);
//     expect(system.cpu.Z).toBe(false);
//     expect(system.cpu.PC).toBe(initialPC + 2);
//   });
// });

// describe('AND_ZeroPage', () => {
//   it('should bitwise-AND the accumulator with the operand at the specified zero page address', () => {
//     const system = createSystem();
//     const write = writeToMemory(system.memory);
//     const initialPC = 0x8000;
//     const initialA = 0b11110000;
//     const operand = 0b10100000;
//     const address = 0x04;

//     system.cpu.A = initialA;
//     system.cpu.PC = initialPC;
//     write(initialPC, address);
//     write(address, operand);
    
//     OpCodes.AND_ZeroPage(system);
//     expect(system.cpu.A).toBe(initialA & operand);
//     expect(system.cpu.N).toBe(true);
//     expect(system.cpu.Z).toBe(false);
//     expect(system.cpu.PC).toBe(initialPC + 1);
//   });
// });

// describe('AND_ZeroPageX', () => {
//   it('should bitwise-AND the accumulator with the operand at the specified zero page address with the offset specified in register X', () => {
//     const system = createSystem();
//     const write = writeToMemory(system.memory);
//     const initialPC = 0x8000;
//     const initialA = 0b11110000;
//     const operand = 0b10100000;
//     const address = 0x04;
//     const offset = 42;

//     system.cpu.A = initialA;
//     system.cpu.X = offset;
//     system.cpu.PC = initialPC;
//     write(initialPC, address);
//     write(address + offset, operand);
    
//     OpCodes.AND_ZeroPageX(system);
//     expect(system.cpu.A).toBe(initialA & operand);
//     expect(system.cpu.N).toBe(true);
//     expect(system.cpu.Z).toBe(false);
//     expect(system.cpu.PC).toBe(initialPC + 1);
//   });
// });

it('should do it', () => {
  expect(true).toBe(true);
})