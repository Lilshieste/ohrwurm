const OpCodes = require('../opcodes');
const { createSystem } = require('../system');
const { writeToMemory } = require('../memory');

const direct = (operand) => () => operand;

describe('ADC', () => {
  it('should set (N)egative flag properly after adding operand to the accumulator', () => {
    const system = createSystem();
    const initialA = 0b01110000;
    const operand1 = 0b01100000;
    const expected = 0b11010000;

    system.cpu.A = initialA;

    OpCodes.ADC(direct(operand1))(system);
    expect(system.cpu.A).toBe(expected);
    expect(system.cpu.N).toBe(true);
    expect(system.cpu.Z).toBe(false);
    expect(system.cpu.C).toBe(false);
    expect(system.cpu.V).toBe(false);
  });

  it('should set (Z)ero flag properly after adding operand to the accumulator', () => {
    const system = createSystem();
    const initialA = 0b11111111;
    const operand1 = 0b00000001;
    const expected = 0b00000000;

    system.cpu.A = initialA;
    
    OpCodes.ADC(direct(operand1))(system);
    expect(system.cpu.A).toBe(expected);
    expect(system.cpu.N).toBe(false);
    expect(system.cpu.Z).toBe(true);
    expect(system.cpu.C).toBe(true);
    expect(system.cpu.V).toBe(true);
  });

  it('should set (C)arry flag properly after adding operand to the accumulator', () => {
    const system = createSystem();
    const initialA = 0b11111111;
    const operand1 = 0b00000001;
    const expected = 0b00000001; // Include the carry-in

    system.cpu.A = initialA;
    system.cpu.C = true;
    
    OpCodes.ADC(direct(operand1))(system);
    expect(system.cpu.A).toBe(expected); 
    expect(system.cpu.N).toBe(false);
    expect(system.cpu.Z).toBe(false);
    expect(system.cpu.C).toBe(true);
    expect(system.cpu.V).toBe(false);
  });

  it('should set o(V)erflow flag properly after adding operand to the accumulator', () => {
    const system = createSystem();
    const initialA = 0b10000000;
    const operand1 = 0b10000000;
    const expected = 0b00000000;

    system.cpu.A = initialA;
    
    OpCodes.ADC(direct(operand1))(system);
    expect(system.cpu.A).toBe(expected);
    expect(system.cpu.N).toBe(false);
    expect(system.cpu.Z).toBe(true);
    expect(system.cpu.C).toBe(true);
    expect(system.cpu.V).toBe(true);
  });
});

describe('AND', () => {
  it('should set (N)egative flag properly after bitwise-AND', () => {
    const system = createSystem();
    const initialA = 0b11110000;
    const operand = 0b10100000;

    system.cpu.A = initialA;
    
    OpCodes.AND(direct(operand))(system);
    expect(system.cpu.A).toBe(initialA & operand);
    expect(system.cpu.N).toBe(true);
    expect(system.cpu.Z).toBe(false);
  });

  it('should set (Z)ero flag properly after bitwise-AND', () => {
    const system = createSystem();
    const initialA = 0b11110000;
    const operand = 0b00000000;

    system.cpu.A = initialA;
    
    OpCodes.AND(direct(operand))(system);
    expect(system.cpu.A).toBe(initialA & operand);
    expect(system.cpu.N).toBe(false);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('BR', () => {
  it('should set the break flag', () => {
    const system = createSystem();
    
    OpCodes.BR(system);

    expect(system.cpu.B).toBe(true);
  });
});

describe('CLC', () => {
  it('should clear the (C)arry flag', () => {
    const system = createSystem();
    system.cpu.C = true;
    
    OpCodes.CLC(system);
    expect(system.cpu.C).toBe(false);
  });
});

describe('CLD', () => {
  it('should clear the (D)ecimal mode flag', () => {
    const system = createSystem();
    system.cpu.D = true;
    
    OpCodes.CLD(system);
    expect(system.cpu.D).toBe(false);
  });
});

describe('CLI', () => {
  it('should clear the (I)nterrupt disable flag', () => {
    const system = createSystem();
    system.cpu.I = true;
    
    OpCodes.CLI(system);
    expect(system.cpu.I).toBe(false);
  });
});

describe('CLV', () => {
  it('should clear the o(V)erflow flag', () => {
    const system = createSystem();
    system.cpu.V = true;
    
    OpCodes.CLV(system);
    expect(system.cpu.V).toBe(false);
  });
});

describe('SEC', () => {
  it('should set the (C)arry flag', () => {
    const system = createSystem();
    system.cpu.C = false;
    
    OpCodes.SEC(system);
    expect(system.cpu.C).toBe(true);
  });
});

describe('SED', () => {
  it('should set the (D)ecimal mode flag', () => {
    const system = createSystem();
    system.cpu.D = false;
    
    OpCodes.SED(system);
    expect(system.cpu.D).toBe(true);
  });
});

describe('SEI', () => {
  it('should set the (I)nterrupt disable flag', () => {
    const system = createSystem();
    system.cpu.I = false;
    
    OpCodes.SEI(system);
    expect(system.cpu.I).toBe(true);
  });
});