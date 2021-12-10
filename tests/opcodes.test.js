const OpCodes = require('../opcodes');
const { createSystem } = require('../system');

const direct = (operand) => (system, op) => op({ operand });
const directContext = (context) => (system, op) => op(context);

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
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.ASL(direct(operand))(system);
    expect(system.cpu.Z).toBe(true);
  });

  it('should set (C)arry flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b11111111;

    OpCodes.ASL(direct(operand))(system);
    expect(system.cpu.C).toBe(true);
  });
});

describe('BCC', () => {
  it('should add the operand to the Program Counter if the (C)arry flag is not set', () => {
    const system = createSystem();
    const startingPC = system.cpu.PC;
    const operand = 0xa;
    
    system.cpu.C = true;
    OpCodes.BCC(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC);

    system.cpu.C = false;
    OpCodes.BCC(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC + operand);

  });
});

describe('BCS', () => {
  it('should add the operand to the Program Counter if the (C)arry flag is set', () => {
    const system = createSystem();
    const startingPC = system.cpu.PC;
    const operand = 0xa;
    
    system.cpu.C = false;
    OpCodes.BCS(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC);

    system.cpu.C = true;
    OpCodes.BCS(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC + operand);

  });
});

describe('BEQ', () => {
  it('should add the operand to the Program Counter if the (Z)ero flag is not set', () => {
    const system = createSystem();
    const startingPC = system.cpu.PC;
    const operand = 0xa;
    
    system.cpu.Z = false;
    OpCodes.BEQ(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC);

    system.cpu.Z = true;
    OpCodes.BEQ(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC + operand);

  });
});

describe('BIT', () => {
  it('should set (N)egative flag properly after bitwise-AND between accumulator and operand', () => {
    const system = createSystem();
    const A =       0b11110000;
    const operand = 0b10100000;

    system.cpu.A = A;
    
    OpCodes.BIT(direct(operand))(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after bitwise-AND between accumulator and operand', () => {
    const system = createSystem();
    const A =       0b00110000;
    const operand = 0b01000011;

    system.cpu.A = A;
    
    OpCodes.BIT(direct(operand))(system);
    expect(system.cpu.Z).toBe(true);
  });

  it('should set o(V)erflow flag properly after bitwise-AND between accumulator and operand', () => {
    const system = createSystem();
    const A =       0b01000000;
    const operand = 0b01010000;

    system.cpu.A = A;
    
    OpCodes.BIT(direct(operand))(system);
    expect(system.cpu.V).toBe(true);
  });
});

describe('BMI', () => {
  it('should add the operand to the Program Counter if the (N)egative flag is set', () => {
    const system = createSystem();
    const startingPC = system.cpu.PC;
    const operand = 0xa;
    
    system.cpu.N = false;
    OpCodes.BMI(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC);

    system.cpu.N = true;
    OpCodes.BMI(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC + operand);

  });
});

describe('BNE', () => {
  it('should add the operand to the Program Counter if the (Z)ero flag is set', () => {
    const system = createSystem();
    const startingPC = system.cpu.PC;
    const operand = 0xa;
    
    system.cpu.Z = true;
    OpCodes.BNE(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC);

    system.cpu.Z = false;
    OpCodes.BNE(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC + operand);

  });
});

describe('BPL', () => {
  it('should add the operand to the Program Counter if the (N)egative flag is not set', () => {
    const system = createSystem();
    const startingPC = system.cpu.PC;
    const operand = 0xa;
    
    system.cpu.N = true;
    OpCodes.BPL(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC);

    system.cpu.N = false;
    OpCodes.BPL(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC + operand);

  });
});

describe('BRK', () => {
  it('should set the break flag', () => {
    const system = createSystem();
    
    OpCodes.BRK(system);

    expect(system.cpu.B).toBe(true);
  });
});

describe('BVC', () => {
  it('should add the operand to the Program Counter if the o(V)erflow flag is not set', () => {
    const system = createSystem();
    const startingPC = system.cpu.PC;
    const operand = 0xa;
    
    system.cpu.V = true;
    OpCodes.BVC(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC);

    system.cpu.V = false;
    OpCodes.BVC(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC + operand);

  });
});

describe('BVS', () => {
  it('should add the operand to the Program Counter if the o(V)erflow flag is set', () => {
    const system = createSystem();
    const startingPC = system.cpu.PC;
    const operand = 0xa;
    
    system.cpu.V = false;
    OpCodes.BVS(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC);

    system.cpu.V = true;
    OpCodes.BVS(direct(operand))(system);
    expect(system.cpu.PC).toBe(startingPC + operand);

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

describe('CMP', () => {
  it('should set (C)arry flag if A >= operand', () => {
    const system = createSystem();
    const A = 0xF;

    system.cpu.A = A;

    OpCodes.CMP(direct(A - 1))(system);
    expect(system.cpu.C).toBe(true);

    OpCodes.CMP(direct(A))(system);
    expect(system.cpu.C).toBe(true);

    OpCodes.CMP(direct(A + 1))(system);
    expect(system.cpu.C).toBe(false);
  });
  
  it('should set (N)egative flag if A < operand', () => {
    const system = createSystem();
    const A = 0xF;

    system.cpu.A = A;

    OpCodes.CMP(direct(A - 1))(system);
    expect(system.cpu.N).toBe(false);

    OpCodes.CMP(direct(A))(system);
    expect(system.cpu.N).toBe(false);

    OpCodes.CMP(direct(A + 1))(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag if A === operand', () => {
    const system = createSystem();
    const A = 0xF;

    system.cpu.A = A;
    
    OpCodes.CMP(direct(A - 1))(system);
    expect(system.cpu.Z).toBe(false);

    OpCodes.CMP(direct(A))(system);
    expect(system.cpu.Z).toBe(true);

    OpCodes.CMP(direct(A + 1))(system);
    expect(system.cpu.Z).toBe(false);
  });
});

describe('CPX', () => {
  it('should set (C)arry flag if X >= operand', () => {
    const system = createSystem();
    const X = 0xF;

    system.cpu.X = X;

    OpCodes.CPX(direct(X - 1))(system);
    expect(system.cpu.C).toBe(true);

    OpCodes.CPX(direct(X))(system);
    expect(system.cpu.C).toBe(true);

    OpCodes.CPX(direct(X + 1))(system);
    expect(system.cpu.C).toBe(false);
  });
  
  it('should set (N)egative flag if X < operand', () => {
    const system = createSystem();
    const X = 0xF;

    system.cpu.X = X;

    OpCodes.CPX(direct(X - 1))(system);
    expect(system.cpu.N).toBe(false);

    OpCodes.CPX(direct(X))(system);
    expect(system.cpu.N).toBe(false);

    OpCodes.CPX(direct(X + 1))(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag if X === operand', () => {
    const system = createSystem();
    const X = 0xF;

    system.cpu.X = X;
    
    OpCodes.CPX(direct(X - 1))(system);
    expect(system.cpu.Z).toBe(false);

    OpCodes.CPX(direct(X))(system);
    expect(system.cpu.Z).toBe(true);

    OpCodes.CPX(direct(X + 1))(system);
    expect(system.cpu.Z).toBe(false);
  });
});

describe('CPY', () => {
  it('should set (C)arry flag if Y >= operand', () => {
    const system = createSystem();
    const Y = 0xF;

    system.cpu.Y = Y;

    OpCodes.CPY(direct(Y - 1))(system);
    expect(system.cpu.C).toBe(true);

    OpCodes.CPY(direct(Y))(system);
    expect(system.cpu.C).toBe(true);

    OpCodes.CPY(direct(Y + 1))(system);
    expect(system.cpu.C).toBe(false);
  });
  
  it('should set (N)egative flag if Y < operand', () => {
    const system = createSystem();
    const Y = 0xF;

    system.cpu.Y = Y;

    OpCodes.CPY(direct(Y - 1))(system);
    expect(system.cpu.N).toBe(false);

    OpCodes.CPY(direct(Y))(system);
    expect(system.cpu.N).toBe(false);

    OpCodes.CPY(direct(Y + 1))(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag if Y === operand', () => {
    const system = createSystem();
    const Y = 0xF;

    system.cpu.Y = Y;
    
    OpCodes.CPY(direct(Y - 1))(system);
    expect(system.cpu.Z).toBe(false);

    OpCodes.CPY(direct(Y))(system);
    expect(system.cpu.Z).toBe(true);

    OpCodes.CPY(direct(Y + 1))(system);
    expect(system.cpu.Z).toBe(false);
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
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after decrementing the operand', () => {
    const system = createSystem();

    OpCodes.DEC(direct(1))(system);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('DEX', () => {
  it('should decrement X by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010100;
    
    system.cpu.X = initial;

    OpCodes.DEX(system);
    expect(system.cpu.X).toBe(expected);
  });

  it('should set (N)egative flag properly after decrementing X', () => {
    const system = createSystem();

    system.cpu.X = 0;

    OpCodes.DEX(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after decrementing X', () => {
    const system = createSystem();

    system.cpu.X = 1;

    OpCodes.DEX(system);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('DEY', () => {
  it('should decrement Y by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010100;
    
    system.cpu.Y = initial;

    OpCodes.DEY(system);
    expect(system.cpu.Y).toBe(expected);
  });

  it('should set (N)egative flag properly after decrementing Y', () => {
    const system = createSystem();

    system.cpu.Y = 0;

    OpCodes.DEY(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after decrementing Y', () => {
    const system = createSystem();

    system.cpu.Y = 1;

    OpCodes.DEY(system);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('EOR', () => {
  it('should set (N)egative flag properly after bitwise-XOR', () => {
    const system = createSystem();
    const initialA =  0b11111111;
    const operand =   0b01111110;

    system.cpu.A = initialA;
    
    OpCodes.EOR(direct(operand))(system);
    expect(system.cpu.A).toBe(initialA ^ operand);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after bitwise-XOR', () => {
    const system = createSystem();
    const initialA =  0b11010010;
    const operand =   0b11010010;

    system.cpu.A = initialA;
    
    OpCodes.EOR(direct(operand))(system);
    expect(system.cpu.A).toBe(initialA ^ operand);
    expect(system.cpu.Z).toBe(true);
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
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after incrementing the operand', () => {
    const system = createSystem();

    OpCodes.INC(direct(255))(system);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('INX', () => {
  it('should increment X by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010110;
    
    system.cpu.X = initial;

    OpCodes.INX(system);
    expect(system.cpu.X).toBe(expected);
  });

  it('should set (N)egative flag properly after incrementing X', () => {
    const system = createSystem();

    system.cpu.X = 127;

    OpCodes.INX(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after incrementing X', () => {
    const system = createSystem();

    system.cpu.X = 255;

    OpCodes.INX(system);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('INY', () => {
  it('should increment Y by one', () => {
    const system = createSystem();
    const initial =   0b00010101;
    const expected =  0b00010110;
    
    system.cpu.Y = initial;

    OpCodes.INY(system);
    expect(system.cpu.Y).toBe(expected);
  });

  it('should set (N)egative flag properly after incrementing Y', () => {
    const system = createSystem();

    system.cpu.Y = 127;

    OpCodes.INY(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after incrementing Y', () => {
    const system = createSystem();

    system.cpu.Y = 255;

    OpCodes.INY(system);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('JMP', () => {
  it('should set the Program Counter to the operand', () => {
    const system = createSystem();
    const operand = 0xdead;
    
    OpCodes.JMP(direct(operand))(system);
    expect(system.cpu.PC).toBe(operand);
  });
});

describe('LDA', () => {
  it('should load operand into accumulator', () => {
    const system = createSystem();
    const operand = 0xa;

    OpCodes.LDA(direct(operand))(system);
    expect(system.cpu.A).toBe(operand);
  });

  it('should set (N)egative flag properly after loading operand into accumulator', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.LDA(direct(operand))(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after loading operand into accumulator', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.LDA(direct(operand))(system);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('LDX', () => {
  it('should load operand into X', () => {
    const system = createSystem();
    const operand = 0xa;

    OpCodes.LDX(direct(operand))(system);
    expect(system.cpu.X).toBe(operand);
  });

  it('should set (N)egative flag properly after loading operand into X', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.LDX(direct(operand))(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after loading operand into X', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.LDX(direct(operand))(system);
    expect(system.cpu.Z).toBe(true);
  });
});

describe('LDY', () => {
  it('should load operand into Y', () => {
    const system = createSystem();
    const operand = 0xa;

    OpCodes.LDY(direct(operand))(system);
    expect(system.cpu.Y).toBe(operand);
  });

  it('should set (N)egative flag properly after loading operand into Y', () => {
    const system = createSystem();
    const operand = 0b10000000;

    OpCodes.LDY(direct(operand))(system);
    expect(system.cpu.N).toBe(true);
  });

  it('should set (Z)ero flag properly after loading operand into Y', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.LDY(direct(operand))(system);
    expect(system.cpu.Z).toBe(true);
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

    system.cpu.N = true;

    OpCodes.LSR(direct(0b10000000))(system);
    expect(system.cpu.N).toBe(false);
  });

  it('should set (Z)ero flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b00000000;

    OpCodes.LSR(direct(operand))(system);
    expect(system.cpu.Z).toBe(true);
  });

  it('should set (C)arry flag properly after shifting the operand', () => {
    const system = createSystem();
    const operand = 0b00000001;

    OpCodes.LSR(direct(operand))(system);
    expect(system.cpu.C).toBe(true);
  });
});

describe('NOP', () => {
  it('should good n you?', () => {
    const system = createSystem();

    OpCodes.NOP(system);
    expect(system).toStrictEqual(createSystem());
  });
});

describe('ORA', () => {
  it('should set (N)egative flag properly after bitwise-OR', () => {
    const system = createSystem();
    const initialA = 0b11110000;
    const operand = 0b10100000;

    system.cpu.A = initialA;
    
    OpCodes.ORA(direct(operand))(system);
    expect(system.cpu.A).toBe(initialA | operand);
    expect(system.cpu.N).toBe(true);
    expect(system.cpu.Z).toBe(false);
  });

  it('should set (Z)ero flag properly after bitwise-OR', () => {
    const system = createSystem();
    const initialA = 0b00000000;
    const operand = 0b00000000;

    system.cpu.A = initialA;
    
    OpCodes.ORA(direct(operand))(system);
    expect(system.cpu.A).toBe(initialA | operand);
    expect(system.cpu.N).toBe(false);
    expect(system.cpu.Z).toBe(true);
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