const OpCodes = require('../../6502/opcodes');
const { createSystem } = require('../../6502/state');
const {
  buildStackAddress,
  buildStatusByte,
  loadStatusByte,
  peek,
  poke,
  pull,
  push } = require('../../6502/memory');

const implied = () => () => {};
const direct = (operand) => (system, op) => op({ operand });
const directContext = (context) => (system, op) => op(context);

describe('ADC', () => {
  it('should set (N)egative flag properly after adding operand to the accumulator', () => {
    const system = createSystem();
    const initialA = 0b01110000;
    const operand1 = 0b01100000;
    const expected = 0b11010000;

    system.registers.A = initialA;

    OpCodes.ADC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected);
    expect(system.registers.N).toBe(true);
    expect(system.registers.Z).toBe(false);
    expect(system.registers.C).toBe(false);
    expect(system.registers.V).toBe(false);
  });

  it('should set (Z)ero flag properly after adding operand to the accumulator', () => {
    const system = createSystem();
    const initialA = 0b11111111;
    const operand1 = 0b00000001;
    const expected = 0b00000000;

    system.registers.A = initialA;
    
    OpCodes.ADC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected);
    expect(system.registers.N).toBe(false);
    expect(system.registers.Z).toBe(true);
    expect(system.registers.C).toBe(true);
    expect(system.registers.V).toBe(true);
  });

  it('should set (C)arry flag properly after adding operand to the accumulator', () => {
    const system = createSystem();
    const initialA = 0b11111111;
    const operand1 = 0b00000001;
    const expected = 0b00000001; // Include the carry-in

    system.registers.A = initialA;
    system.registers.C = true;
    
    OpCodes.ADC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected); 
    expect(system.registers.N).toBe(false);
    expect(system.registers.Z).toBe(false);
    expect(system.registers.C).toBe(true);
    expect(system.registers.V).toBe(false);
  });

  it('should set o(V)erflow flag properly after adding operand to the accumulator', () => {
    const system = createSystem();
    const initialA = 0b10000000;
    const operand1 = 0b10000000;
    const expected = 0b00000000;

    system.registers.A = initialA;
    
    OpCodes.ADC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected);
    expect(system.registers.N).toBe(false);
    expect(system.registers.Z).toBe(true);
    expect(system.registers.C).toBe(true);
    expect(system.registers.V).toBe(true);
  });
});

describe('AND', () => {
  it('should set (N)egative flag properly after bitwise-AND', () => {
    const system = createSystem();
    const initialA = 0b11110000;
    const operand = 0b10100000;

    system.registers.A = initialA;
    
    OpCodes.AND(direct(operand))(system);
    expect(system.registers.A).toBe(initialA & operand);
    expect(system.registers.N).toBe(true);
    expect(system.registers.Z).toBe(false);
  });

  it('should set (Z)ero flag properly after bitwise-AND', () => {
    const system = createSystem();
    const initialA = 0b11110000;
    const operand = 0b00000000;

    system.registers.A = initialA;
    
    OpCodes.AND(direct(operand))(system);
    expect(system.registers.A).toBe(initialA & operand);
    expect(system.registers.N).toBe(false);
    expect(system.registers.Z).toBe(true);
  });
});

describe('ASL', () => {
  it('should shift the operand left by one bit', () => {
    const system = createSystem();
    const initial =   0b00010100;
    const expected =  0b00101000;
    const context = { operand: initial };

    OpCodes.ASL(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });

  it('should set (N)egative flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b01110000;

    OpCodes.ASL(direct(operand))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.ASL(direct(operand))(system);
    expect(system.registers.Z).toBe(true);
  });

  it('should set (C)arry flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b11111111;

    OpCodes.ASL(direct(operand))(system);
    expect(system.registers.C).toBe(true);
  });
});

describe('BCC', () => {
  it('should add the operand to the Program Counter if the (C)arry flag is not set', () => {
    const system = createSystem();
    const startingPC = system.registers.PC;
    const operand = 0xa;
    
    system.registers.C = true;
    OpCodes.BCC(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC);

    system.registers.C = false;
    OpCodes.BCC(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC + operand);

  });
});

describe('BCS', () => {
  it('should add the operand to the Program Counter if the (C)arry flag is set', () => {
    const system = createSystem();
    const startingPC = system.registers.PC;
    const operand = 0xa;
    
    system.registers.C = false;
    OpCodes.BCS(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC);

    system.registers.C = true;
    OpCodes.BCS(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC + operand);

  });
});

describe('BEQ', () => {
  it('should add the operand to the Program Counter if the (Z)ero flag is not set', () => {
    const system = createSystem();
    const startingPC = system.registers.PC;
    const operand = 0xa;
    
    system.registers.Z = false;
    OpCodes.BEQ(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC);

    system.registers.Z = true;
    OpCodes.BEQ(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC + operand);

  });
});

describe('BIT', () => {
  it('should set (N)egative flag properly after bitwise-AND between accumulator and operand', () => {
    const system = createSystem();
    const A =       0b11110000;
    const operand = 0b10100000;

    system.registers.A = A;
    
    OpCodes.BIT(direct(operand))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after bitwise-AND between accumulator and operand', () => {
    const system = createSystem();
    const A =       0b00110000;
    const operand = 0b01000011;

    system.registers.A = A;
    
    OpCodes.BIT(direct(operand))(system);
    expect(system.registers.Z).toBe(true);
  });

  it('should set o(V)erflow flag properly after bitwise-AND between accumulator and operand', () => {
    const system = createSystem();
    const A =       0b01000000;
    const operand = 0b01010000;

    system.registers.A = A;
    
    OpCodes.BIT(direct(operand))(system);
    expect(system.registers.V).toBe(true);
  });
});

describe('BMI', () => {
  it('should add the operand to the Program Counter if the (N)egative flag is set', () => {
    const system = createSystem();
    const startingPC = system.registers.PC;
    const operand = 0xa;
    
    system.registers.N = false;
    OpCodes.BMI(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC);

    system.registers.N = true;
    OpCodes.BMI(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC + operand);

  });
});

describe('BNE', () => {
  it('should add the operand to the Program Counter if the (Z)ero flag is set', () => {
    const system = createSystem();
    const startingPC = system.registers.PC;
    const operand = 0xa;
    
    system.registers.Z = true;
    OpCodes.BNE(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC);

    system.registers.Z = false;
    OpCodes.BNE(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC + operand);

  });
});

describe('BPL', () => {
  it('should add the operand to the Program Counter if the (N)egative flag is not set', () => {
    const system = createSystem();
    const startingPC = system.registers.PC;
    const operand = 0xa;
    
    system.registers.N = true;
    OpCodes.BPL(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC);

    system.registers.N = false;
    OpCodes.BPL(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC + operand);

  });
});

describe('BRK', () => {
  it('should push the high and low bytes of the Program Counter onto the stack, followed by the Status flags with the (B)reak flag set', () => {
    const system = createSystem();
    const testAddress = 0x7654;
    const highByte = (testAddress >> 8) & 0xFF;
    const lowByte = (testAddress & 0xFF);
    const startingStatusByte = 0b11100011;
    const expectedStatusByte = 0b11110011;

    system.registers.PC = testAddress;
    loadStatusByte(system.registers, startingStatusByte);

    OpCodes.BRK(peek, push)(system);
    expect(peek(system.memory, buildStackAddress(system.registers.SP + 3))).toBe(highByte);
    expect(peek(system.memory, buildStackAddress(system.registers.SP + 2))).toBe(lowByte);
    expect(peek(system.memory, buildStackAddress(system.registers.SP + 1))).toBe(expectedStatusByte);
  });

  it('should set the Program Counter to the address indicated by the IRQ interrupt vectors ($FFFE/FF)', () => {
    const system = createSystem();
    const isrLowByte = 0xad;
    const isrHighByte = 0xde;
    const expectedPC = (isrHighByte << 8) + isrLowByte;

    system.registers.PC = 0x0000;
    poke(system.memory, 0xFFFE, isrLowByte);
    poke(system.memory, 0xFFFF, isrHighByte);

    OpCodes.BRK(peek, push)(system);
    expect(system.registers.PC).toBe(expectedPC);
  });
});

describe('BVC', () => {
  it('should add the operand to the Program Counter if the o(V)erflow flag is not set', () => {
    const system = createSystem();
    const startingPC = system.registers.PC;
    const operand = 0xa;
    
    system.registers.V = true;
    OpCodes.BVC(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC);

    system.registers.V = false;
    OpCodes.BVC(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC + operand);

  });
});

describe('BVS', () => {
  it('should add the operand to the Program Counter if the o(V)erflow flag is set', () => {
    const system = createSystem();
    const startingPC = system.registers.PC;
    const operand = 0xa;
    
    system.registers.V = false;
    OpCodes.BVS(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC);

    system.registers.V = true;
    OpCodes.BVS(direct(operand))(system);
    expect(system.registers.PC).toBe(startingPC + operand);

  });
});

describe('CLC', () => {
  it('should clear the (C)arry flag', () => {
    const system = createSystem();
    system.registers.C = true;
    
    OpCodes.CLC(implied)(system);
    expect(system.registers.C).toBe(false);
  });
});

describe('CLD', () => {
  it('should clear the (D)ecimal mode flag', () => {
    const system = createSystem();
    system.registers.D = true;
    
    OpCodes.CLD(implied)(system);
    expect(system.registers.D).toBe(false);
  });
});

describe('CLI', () => {
  it('should clear the (I)nterrupt disable flag', () => {
    const system = createSystem();
    system.registers.I = true;
    
    OpCodes.CLI(implied)(system);
    expect(system.registers.I).toBe(false);
  });
});

describe('CLV', () => {
  it('should clear the o(V)erflow flag', () => {
    const system = createSystem();
    system.registers.V = true;
    
    OpCodes.CLV(implied)(system);
    expect(system.registers.V).toBe(false);
  });
});

describe('CMP', () => {
  it('should set (C)arry flag if A >= operand', () => {
    const system = createSystem();
    const A = 0xF;

    system.registers.A = A;

    OpCodes.CMP(direct(A - 1))(system);
    expect(system.registers.C).toBe(true);

    OpCodes.CMP(direct(A))(system);
    expect(system.registers.C).toBe(true);

    OpCodes.CMP(direct(A + 1))(system);
    expect(system.registers.C).toBe(false);
  });
  
  it('should set (N)egative flag if A < operand', () => {
    const system = createSystem();
    const A = 0xF;

    system.registers.A = A;

    OpCodes.CMP(direct(A - 1))(system);
    expect(system.registers.N).toBe(false);

    OpCodes.CMP(direct(A))(system);
    expect(system.registers.N).toBe(false);

    OpCodes.CMP(direct(A + 1))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag if A === operand', () => {
    const system = createSystem();
    const A = 0xF;

    system.registers.A = A;
    
    OpCodes.CMP(direct(A - 1))(system);
    expect(system.registers.Z).toBe(false);

    OpCodes.CMP(direct(A))(system);
    expect(system.registers.Z).toBe(true);

    OpCodes.CMP(direct(A + 1))(system);
    expect(system.registers.Z).toBe(false);
  });
});

describe('CPX', () => {
  it('should set (C)arry flag if X >= operand', () => {
    const system = createSystem();
    const X = 0xF;

    system.registers.X = X;

    OpCodes.CPX(direct(X - 1))(system);
    expect(system.registers.C).toBe(true);

    OpCodes.CPX(direct(X))(system);
    expect(system.registers.C).toBe(true);

    OpCodes.CPX(direct(X + 1))(system);
    expect(system.registers.C).toBe(false);
  });
  
  it('should set (N)egative flag if X < operand', () => {
    const system = createSystem();
    const X = 0xF;

    system.registers.X = X;

    OpCodes.CPX(direct(X - 1))(system);
    expect(system.registers.N).toBe(false);

    OpCodes.CPX(direct(X))(system);
    expect(system.registers.N).toBe(false);

    OpCodes.CPX(direct(X + 1))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag if X === operand', () => {
    const system = createSystem();
    const X = 0xF;

    system.registers.X = X;
    
    OpCodes.CPX(direct(X - 1))(system);
    expect(system.registers.Z).toBe(false);

    OpCodes.CPX(direct(X))(system);
    expect(system.registers.Z).toBe(true);

    OpCodes.CPX(direct(X + 1))(system);
    expect(system.registers.Z).toBe(false);
  });
});

describe('CPY', () => {
  it('should set (C)arry flag if Y >= operand', () => {
    const system = createSystem();
    const Y = 0xF;

    system.registers.Y = Y;

    OpCodes.CPY(direct(Y - 1))(system);
    expect(system.registers.C).toBe(true);

    OpCodes.CPY(direct(Y))(system);
    expect(system.registers.C).toBe(true);

    OpCodes.CPY(direct(Y + 1))(system);
    expect(system.registers.C).toBe(false);
  });
  
  it('should set (N)egative flag if Y < operand', () => {
    const system = createSystem();
    const Y = 0xF;

    system.registers.Y = Y;

    OpCodes.CPY(direct(Y - 1))(system);
    expect(system.registers.N).toBe(false);

    OpCodes.CPY(direct(Y))(system);
    expect(system.registers.N).toBe(false);

    OpCodes.CPY(direct(Y + 1))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag if Y === operand', () => {
    const system = createSystem();
    const Y = 0xF;

    system.registers.Y = Y;
    
    OpCodes.CPY(direct(Y - 1))(system);
    expect(system.registers.Z).toBe(false);

    OpCodes.CPY(direct(Y))(system);
    expect(system.registers.Z).toBe(true);

    OpCodes.CPY(direct(Y + 1))(system);
    expect(system.registers.Z).toBe(false);
  });
});

describe('DEC', () => {
  it('should decrement the operand by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010100;
    const context = { operand: initial };

    OpCodes.DEC(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });

  it('should set (N)egative flag properly after decrementing the operand', () => {
    const system = createSystem();

    OpCodes.DEC(direct(0))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after decrementing the operand', () => {
    const system = createSystem();

    OpCodes.DEC(direct(1))(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('DEX', () => {
  it('should decrement X by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010100;
    
    system.registers.X = initial;

    OpCodes.DEX(implied)(system);
    expect(system.registers.X).toBe(expected);
  });

  it('should set (N)egative flag properly after decrementing X', () => {
    const system = createSystem();

    system.registers.X = 0;

    OpCodes.DEX(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after decrementing X', () => {
    const system = createSystem();

    system.registers.X = 1;

    OpCodes.DEX(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('DEY', () => {
  it('should decrement Y by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010100;
    
    system.registers.Y = initial;

    OpCodes.DEY(implied)(system);
    expect(system.registers.Y).toBe(expected);
  });

  it('should set (N)egative flag properly after decrementing Y', () => {
    const system = createSystem();

    system.registers.Y = 0;

    OpCodes.DEY(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after decrementing Y', () => {
    const system = createSystem();

    system.registers.Y = 1;

    OpCodes.DEY(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('EOR', () => {
  it('should set (N)egative flag properly after bitwise-XOR', () => {
    const system = createSystem();
    const initialA =  0b11111111;
    const operand =   0b01111110;

    system.registers.A = initialA;
    
    OpCodes.EOR(direct(operand))(system);
    expect(system.registers.A).toBe(initialA ^ operand);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after bitwise-XOR', () => {
    const system = createSystem();
    const initialA =  0b11010010;
    const operand =   0b11010010;

    system.registers.A = initialA;
    
    OpCodes.EOR(direct(operand))(system);
    expect(system.registers.A).toBe(initialA ^ operand);
    expect(system.registers.Z).toBe(true);
  });
});

describe('INC', () => {
  it('should increment the operand by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010110;
    const context = { operand: initial };

    OpCodes.INC(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });

  it('should set (N)egative flag properly after incrementing the operand', () => {
    const system = createSystem();

    OpCodes.INC(direct(127))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after incrementing the operand', () => {
    const system = createSystem();

    OpCodes.INC(direct(255))(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('INX', () => {
  it('should increment X by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010110;
    
    system.registers.X = initial;

    OpCodes.INX(implied)(system);
    expect(system.registers.X).toBe(expected);
  });

  it('should set (N)egative flag properly after incrementing X', () => {
    const system = createSystem();

    system.registers.X = 127;

    OpCodes.INX(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after incrementing X', () => {
    const system = createSystem();

    system.registers.X = 255;

    OpCodes.INX(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('INY', () => {
  it('should increment Y by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010110;
    
    system.registers.Y = initial;

    OpCodes.INY(implied)(system);
    expect(system.registers.Y).toBe(expected);
  });

  it('should set (N)egative flag properly after incrementing Y', () => {
    const system = createSystem();

    system.registers.Y = 127;

    OpCodes.INY(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after incrementing Y', () => {
    const system = createSystem();

    system.registers.Y = 255;

    OpCodes.INY(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('JMP', () => {
  it('should set the Program Counter to the operand', () => {
    const system = createSystem();
    const operand = 0xdead;
    
    OpCodes.JMP(direct(operand))(system);
    expect(system.registers.PC).toBe(operand);
  });
});

describe('JSR', () => {
  it('should push the high and low bytes of the 16-bit address (-1) of the next operation onto the stack', () => {
    const system = createSystem();
    const testAddress = 0x7654;
    const highByte = (testAddress >> 8) & 0xFF;
    const lowByte = (testAddress & 0xFF);

    system.registers.PC = 0x7654;

    OpCodes.JSR(direct(0x0000))(system);
    expect(peek(system.memory, buildStackAddress(system.registers.SP + 2))).toBe(highByte);
    expect(peek(system.memory, buildStackAddress(system.registers.SP + 1))).toBe(lowByte - 1);
  });

  it('should set the Program Counter to the operand', () => {
    const system = createSystem();
    const operand = 0xdead;

    system.registers.PC = 0x0000;

    OpCodes.JSR(direct(operand))(system);
    expect(system.registers.PC).toBe(operand);
  });
});

describe('LDA', () => {
  it('should load operand into accumulator', () => {
    const system = createSystem();
    const operand = 0xa;

    OpCodes.LDA(direct(operand))(system);
    expect(system.registers.A).toBe(operand);
  });

  it('should set (N)egative flag properly after loading operand into accumulator', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.LDA(direct(operand))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after loading operand into accumulator', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.LDA(direct(operand))(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('LDX', () => {
  it('should load operand into X', () => {
    const system = createSystem();
    const operand = 0xa;

    OpCodes.LDX(direct(operand))(system);
    expect(system.registers.X).toBe(operand);
  });

  it('should set (N)egative flag properly after loading operand into X', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.LDX(direct(operand))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after loading operand into X', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.LDX(direct(operand))(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('LDY', () => {
  it('should load operand into Y', () => {
    const system = createSystem();
    const operand = 0xa;

    OpCodes.LDY(direct(operand))(system);
    expect(system.registers.Y).toBe(operand);
  });

  it('should set (N)egative flag properly after loading operand into Y', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.LDY(direct(operand))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after loading operand into Y', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.LDY(direct(operand))(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('LSR', () => {
  it('should shift the operand right by one bit', () => {
    const system = createSystem();
    const initial =  0b00101000;
    const expected = 0b00010100;
    const context = { operand: initial };

    OpCodes.LSR(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });

  it('should clear the (N)egative flag after shifting the operand', () => {
    const system = createSystem();

    system.registers.N = true;

    OpCodes.LSR(direct(0b10000000))(system);
    expect(system.registers.N).toBe(false);
  });

  it('should set (Z)ero flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.LSR(direct(operand))(system);
    expect(system.registers.Z).toBe(true);
  });

  it('should set (C)arry flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b00000001;

    OpCodes.LSR(direct(operand))(system);
    expect(system.registers.C).toBe(true);
  });
});

describe('NOP', () => {
  it('should good n you?', () => {
    const system = createSystem();

    OpCodes.NOP(implied)(system);
    expect(system).toStrictEqual(createSystem());
  });
});

describe('ORA', () => {
  it('should set (N)egative flag properly after bitwise-OR', () => {
    const system = createSystem();
    const initialA = 0b11110000;
    const operand = 0b10100000;

    system.registers.A = initialA;
    
    OpCodes.ORA(direct(operand))(system);
    expect(system.registers.A).toBe(initialA | operand);
    expect(system.registers.N).toBe(true);
    expect(system.registers.Z).toBe(false);
  });

  it('should set (Z)ero flag properly after bitwise-OR', () => {
    const system = createSystem();
    const initialA = 0b00000000;
    const operand = 0b00000000;

    system.registers.A = initialA;
    
    OpCodes.ORA(direct(operand))(system);
    expect(system.registers.A).toBe(initialA | operand);
    expect(system.registers.N).toBe(false);
    expect(system.registers.Z).toBe(true);
  });
});

describe('PHA', () => {
  it('should push the current value in the accumulator onto the stack', () => {
    const system = createSystem();
    const expected = 42;
    const startingSP = system.registers.SP;

    system.registers.A = expected;

    OpCodes.PHA(implied)(system);
    expect(peek(system.memory, buildStackAddress(startingSP))).toBe(expected);
  });
});

describe('PHP', () => {
  it('should push the current value of the processor status flags onto the stack', () => {
    const system = createSystem();
    const startingSP = system.registers.SP;

    system.registers.C = true;
    system.registers.Z = true;
    system.registers.I = true;
    system.registers.D = true;
    system.registers.B = true;
    system.registers.V = true;
    system.registers.N = true;

    const expected = buildStatusByte(system.registers);

    OpCodes.PHP(implied)(system);
    expect(peek(system.memory, buildStackAddress(startingSP))).toBe(expected);
  });
});

describe('PLA', () => {
  it('should pull a value from the stack and store it in the accumulator', () => {
    const system = createSystem();
    const expected = 42;

    push(system.memory, system.registers, expected);
    
    OpCodes.PLA(implied)(system);
    expect(system.registers.A).toBe(expected);
  });

  it('should set (N)egative flag properly after loading operand into accumulator', () => {
    const system = createSystem();

    push(system.memory, system.registers, 0b10000000);
    system.registers.N = false;

    OpCodes.PLA(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after loading operand into accumulator', () => {
    const system = createSystem();

    push(system.memory, system.registers, 0b00000000);
    system.registers.Z = false;

    OpCodes.PLA(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('PLP', () => {
  it('should pull a value from the stack and load it into the status flags', () => {
    const system = createSystem();

    push(system.memory, system.registers, 0b11111111);
    system.registers.C = false;
    system.registers.Z = false;
    system.registers.I = false;
    system.registers.D = false;
    system.registers.B = false;
    system.registers.V = false;
    system.registers.N = false;

    OpCodes.PLP(implied)(system);
    expect(system.registers.C).toBe(true);
    expect(system.registers.Z).toBe(true);
    expect(system.registers.I).toBe(true);
    expect(system.registers.D).toBe(true);
    expect(system.registers.B).toBe(true);
    expect(system.registers.V).toBe(true);
    expect(system.registers.N).toBe(true);
  });
});

describe('ROL', () => {
  it('should shift the operand left by one bit', () => {
    const system = createSystem();
    const initial =   0b00010100;
    const expected =  0b00101000;
    const context = { operand: initial };

    OpCodes.ROL(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });

  it('should shift the carry-in to bit 0', () => {
    const system = createSystem();
    const initial =   0b00000000;
    const expected =  0b00000001;
    const context = { operand: initial };

    system.registers.C = true;

    OpCodes.ROL(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });

  it('should set (N)egative flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b01110000;

    OpCodes.ROL(direct(operand))(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.ROL(direct(operand))(system);
    expect(system.registers.Z).toBe(true);
  });

  it('should set (C)arry flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b11111111;

    OpCodes.ROL(direct(operand))(system);
    expect(system.registers.C).toBe(true);
  });
});

describe('ROR', () => {
  it('should shift the operand right by one bit', () => {
    const system = createSystem();
    const initial =  0b00101000;
    const expected = 0b00010100;
    const context = { operand: initial };

    OpCodes.ROR(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });

  it('should shift the carry-in to bit 7', () => {
    const system = createSystem();
    const initial =   0b00000000;
    const expected =  0b10000000;
    const context = { operand: initial };

    system.registers.C = true;

    OpCodes.ROR(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });

  it('should clear the (N)egative flag after shifting the operand', () => {
    const system = createSystem();

    system.registers.N = true;

    OpCodes.ROR(direct(0b10000000))(system);
    expect(system.registers.N).toBe(false);
  });

  it('should set (Z)ero flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.ROR(direct(operand))(system);
    expect(system.registers.Z).toBe(true);
  });

  it('should set (C)arry flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b00000001;

    OpCodes.ROR(direct(operand))(system);
    expect(system.registers.C).toBe(true);
  });
});

describe('RTI', () => {
  it('should pull (and load) the Status flags and Program Counter from the stack', () => {
    const system = createSystem();
    const testAddress = 0x7654;
    const highByte = (testAddress >> 8) & 0xFF;
    const lowByte = (testAddress & 0xFF);
    const statusByte = 0b11110011;

    system.registers.PC = 0x0;
    push(system.memory, system.registers, highByte);
    push(system.memory, system.registers, lowByte);
    push(system.memory, system.registers, statusByte);

    OpCodes.RTI(pull, implied)(system);
    expect(buildStatusByte(system.registers)).toBe(statusByte);
    expect(system.registers.PC).toBe(testAddress);
  });
});

describe('RTS', () => {
  it('should pull (and load) the Program Counter from the stack', () => {
    const system = createSystem();
    const expected = 0xdead;
    const lowByte = expected & 0xFF;
    const highByte = (expected >> 8) & 0xFF;

    push(system.memory, system.registers, highByte);
    push(system.memory, system.registers, lowByte);
    system.registers.PC = 0x0000;

    OpCodes.RTS(pull, implied)(system);
    expect(system.registers.PC).toBe(expected);
  });
});

describe('SBC', () => {
  it('should subtracting the operand from the accumulator and the not of the (C)arry flag', () => {
    const system = createSystem();
    const initialA = 0b11110001;
    const operand1 = 0b01100000;
    const expected = 0b10010000;

    system.registers.A = initialA;

    OpCodes.SBC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected);
  });

  it('should set (N)egative flag properly after subtracting the operand from the accumulator', () => {
    const system = createSystem();
    const initialA = 0b11110000;
    const operand1 = 0b01100000;
    const expected = 0b10010000;

    system.registers.A = initialA;
    system.registers.C = true;

    OpCodes.SBC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected);
    expect(system.registers.N).toBe(true);
    expect(system.registers.Z).toBe(false);
    expect(system.registers.C).toBe(false);
    expect(system.registers.V).toBe(false);
  });

  it('should set (Z)ero flag properly after subtracting the operand from the accumulator', () => {
    const system = createSystem();
    const initialA = 0b11111111;
    const operand1 = 0b11111111;
    const expected = 0b00000000;

    system.registers.A = initialA;
    system.registers.C = true;
    
    OpCodes.SBC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected);
    expect(system.registers.N).toBe(false);
    expect(system.registers.Z).toBe(true);
    expect(system.registers.C).toBe(false);
    expect(system.registers.V).toBe(true);
  });

  it('should set (C)arry flag properly after subtracting the operand from the accumulator', () => {
    const system = createSystem();
    const initialA = 0b00000000;
    const operand1 = 0b00000001;
    const expected = 0b11111111;

    system.registers.A = initialA;
    system.registers.C = true;
    
    OpCodes.SBC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected); 
    expect(system.registers.N).toBe(true);
    expect(system.registers.Z).toBe(false);
    expect(system.registers.C).toBe(true);
    expect(system.registers.V).toBe(true);
  });

  it('should set o(V)erflow flag properly after subtracting the operand from the accumulator', () => {
    const system = createSystem();
    const initialA = 0b00000000;
    const operand1 = 0b00000001;
    const expected = 0b11111111;

    system.registers.A = initialA;
    system.registers.C = true;
    
    OpCodes.SBC(direct(operand1))(system);
    expect(system.registers.A).toBe(expected);
    expect(system.registers.N).toBe(true);
    expect(system.registers.Z).toBe(false);
    expect(system.registers.C).toBe(true);
    expect(system.registers.V).toBe(true);
  });
});

describe('SEC', () => {
  it('should set the (C)arry flag', () => {
    const system = createSystem();
    system.registers.C = false;
    
    OpCodes.SEC(implied)(system);
    expect(system.registers.C).toBe(true);
  });
});

describe('SED', () => {
  it('should set the (D)ecimal mode flag', () => {
    const system = createSystem();
    system.registers.D = false;
    
    OpCodes.SED(implied)(system);
    expect(system.registers.D).toBe(true);
  });
});

describe('SEI', () => {
  it('should set the (I)nterrupt disable flag', () => {
    const system = createSystem();
    system.registers.I = false;
    
    OpCodes.SEI(implied)(system);
    expect(system.registers.I).toBe(true);
  });
});

describe('STA', () => {
  it('should store accumulator contents in operand', () => {
    const system = createSystem();
    const operand = 0xa;
    const context = { operand };
    const expected = 42;

    system.registers.A = expected;

    OpCodes.STA(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });
});

describe('STX', () => {
  it('should store X contents in operand', () => {
    const system = createSystem();
    const operand = 0xa;
    const context = { operand };
    const expected = 42;

    system.registers.X = expected;

    OpCodes.STX(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });
});

describe('STY', () => {
  it('should store Y contents in operand', () => {
    const system = createSystem();
    const operand = 0xa;
    const context = { operand };
    const expected = 42;

    system.registers.Y = expected;

    OpCodes.STY(directContext(context))(system);
    expect(context.operand).toBe(expected);
  });
});

describe('TAX', () => {
  it('should transfer accumulator contents to X', () => {
    const system = createSystem();
    const expected = 42;

    system.registers.A = expected;

    OpCodes.TAX(implied)(system);
    expect(system.registers.X).toBe(expected);
  });

  it('should set (N)egative flag properly after transferring contents', () => {
    const system = createSystem();
    const A = 0b10000000;

    system.registers.A = A;

    OpCodes.TAX(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after transferring contents', () => {
    const system = createSystem();
    const A = 0b00000000;

    system.registers.A = A;

    OpCodes.TAX(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('TAY', () => {
  it('should transfer accumulator contents to Y', () => {
    const system = createSystem();
    const expected = 42;

    system.registers.A = expected;

    OpCodes.TAY(implied)(system);
    expect(system.registers.Y).toBe(expected);
  });

  it('should set (N)egative flag properly after transferring contents', () => {
    const system = createSystem();
    const A = 0b10000000;

    system.registers.A = A;

    OpCodes.TAY(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after transferring contents', () => {
    const system = createSystem();
    const A = 0b00000000;

    system.registers.A = A;

    OpCodes.TAY(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('TSX', () => {
  it('should transfer Stack Pointer to X', () => {
    const system = createSystem();
    const expected = 42;

    system.registers.SP = expected;

    OpCodes.TSX(implied)(system);
    expect(system.registers.X).toBe(expected);
  });

  it('should set (N)egative flag properly after transferring contents', () => {
    const system = createSystem();
    const SP = 0b10000000;

    system.registers.SP = SP;

    OpCodes.TSX(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after transferring contents', () => {
    const system = createSystem();
    const SP = 0b00000000;

    system.registers.SP = SP;

    OpCodes.TSX(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('TXA', () => {
  it('should transfer X contents to accumulator', () => {
    const system = createSystem();
    const expected = 42;

    system.registers.X = expected;

    OpCodes.TXA(implied)(system);
    expect(system.registers.A).toBe(expected);
  });

  it('should set (N)egative flag properly after transferring contents', () => {
    const system = createSystem();
    const X = 0b10000000;

    system.registers.X = X;

    OpCodes.TXA(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after transferring contents', () => {
    const system = createSystem();
    const X = 0b00000000;

    system.registers.X = X;

    OpCodes.TXA(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});

describe('TXS', () => {
  it('should transfer X to Stack Pointer', () => {
    const system = createSystem();
    const expected = 42;

    system.registers.X = expected;

    OpCodes.TXS(implied)(system);
    expect(system.registers.SP).toBe(expected);
  });
});

describe('TYA', () => {
  it('should transfer Y contents to accumulator', () => {
    const system = createSystem();
    const expected = 42;

    system.registers.Y = expected;

    OpCodes.TYA(implied)(system);
    expect(system.registers.A).toBe(expected);
  });

  it('should set (N)egative flag properly after transferring contents', () => {
    const system = createSystem();
    const Y = 0b10000000;

    system.registers.Y = Y;

    OpCodes.TYA(implied)(system);
    expect(system.registers.N).toBe(true);
  });

  it('should set (Z)ero flag properly after transferring contents', () => {
    const system = createSystem();
    const Y = 0b00000000;

    system.registers.Y = Y;

    OpCodes.TYA(implied)(system);
    expect(system.registers.Z).toBe(true);
  });
});
