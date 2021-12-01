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
