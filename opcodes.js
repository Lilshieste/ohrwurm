// TODO: Consider returning new operand from addressingMode callback instead of overwriting parameter
//  (Wait until all opcodes are implemented, to make sure there isn't a lurking reason to NOT do this)

const isNthBitSet = (byte, n) => Boolean(byte & (1 << n));
const isOverflowBitSet = (carryIn, carryOut) => Boolean(carryIn ^ carryOut);
const isOverflow = (a, b, result) => Boolean((~(a ^ b)) & (a ^ result) & 0x80);
const isNegativeBitSet = (byte) => Boolean(byte & 0b10000000);
const isCarryBitSet = (byte) => Boolean(byte & 0b100000000);
const isZero = (byte) => byte === 0;
const toByte = (val) => val & 0xFF;

const OpCodes = module.exports;

OpCodes.NotImplemented = () => { throw new Error(`This opcode hasn't been implemented yet`); }
OpCodes.Unofficial = OpCodes.NotImplemented;

OpCodes.ADC = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const carryIn = system.registers.C;
    const result = system.registers.A + context.operand + (system.registers.C ? 1 : 0);
    const carryOut = isCarryBitSet(result);
  
    system.registers.A = toByte(result);
    system.registers.N = isNegativeBitSet(result);
    system.registers.Z = isZero(toByte(result));
    system.registers.C = carryOut;
    system.registers.V = isOverflowBitSet(carryIn, carryOut);
  });
};

OpCodes.AND = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.A &= context.operand;
    system.registers.N = isNegativeBitSet(system.registers.A);
    system.registers.Z = isZero(system.registers.A);
  });
};

OpCodes.ASL = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const result = toByte(context.operand << 1);
    system.registers.N = isNthBitSet(result, 7);
    system.registers.Z = isZero(result);
    system.registers.C = isNthBitSet(context.operand, 7);

    context.operand = result;
  });
};

OpCodes.BCC = (addressingMode) => (system) => {
  addressingMode(system, context => {
    if(!system.registers.C) {
      system.registers.PC += context.operand;
    }
  });
};

OpCodes.BCS = (addressingMode) => (system) => {
  addressingMode(system, context => {
    if(system.registers.C) {
      system.registers.PC += context.operand;
    }
  });
};

OpCodes.BEQ = (addressingMode) => (system) => {
  addressingMode(system, context => {
    if(system.registers.Z) {
      system.registers.PC += context.operand;
    }
  });
};

OpCodes.BIT = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const result = system.registers.A & context.operand;
    system.registers.Z = isZero(result);
    system.registers.N = isNegativeBitSet(result);
    system.registers.V = isNthBitSet(result, 6);
  });
};

OpCodes.BMI = (addressingMode) => (system) => {
  addressingMode(system, context => {
    if(system.registers.N) {
      system.registers.PC += context.operand;
    }
  });
};

OpCodes.BNE = (addressingMode) => (system) => {
  addressingMode(system, context => {
    if(!system.registers.Z) {
      system.registers.PC += context.operand;
    }
  });
};

OpCodes.BPL = (addressingMode) => (system) => {
  addressingMode(system, context => {
    if(!system.registers.N) {
      system.registers.PC += context.operand;
    }
  });
};

OpCodes.BRK = (system) => {
  system.registers.B = true;
  // TODO: still need to push PC (+2) and status to stack
};

OpCodes.BVC = (addressingMode) => (system) => {
  addressingMode(system, context => {
    if(!system.registers.V) {
      system.registers.PC += context.operand;
    }
  });
};

OpCodes.BVS = (addressingMode) => (system) => {
  addressingMode(system, context => {
    if(system.registers.V) {
      system.registers.PC += context.operand;
    }
  });
};

OpCodes.CLC = (system) => {
  system.registers.C = false;
};

OpCodes.CLD = (system) => {
  system.registers.D = false;
};

OpCodes.CLI = (system) => {
  system.registers.I = false;
};

OpCodes.CLV = (system) => {
  system.registers.V = false;
};

OpCodes.CMP = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.C = system.registers.A >= context.operand;
    system.registers.N = system.registers.A < context.operand;
    system.registers.Z = system.registers.A === context.operand;
  });
};

OpCodes.CPX = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.C = system.registers.X >= context.operand;
    system.registers.N = system.registers.X < context.operand;
    system.registers.Z = system.registers.X === context.operand;
  });
};

OpCodes.CPY = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.C = system.registers.Y >= context.operand;
    system.registers.N = system.registers.Y < context.operand;
    system.registers.Z = system.registers.Y === context.operand;
  });
};

OpCodes.DEC = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const result = toByte((context.operand - 1) >>> 0);
    system.registers.N = isNegativeBitSet(result);
    system.registers.Z = isZero(result);
    context.operand = result;
  });
};

OpCodes.DEX = (system) => {
  const result = toByte((system.registers.X - 1) >>> 0);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  system.registers.X = result;
};

OpCodes.DEY = (system) => {
  const result = toByte((system.registers.Y - 1) >>> 0);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  system.registers.Y = result;
};

OpCodes.EOR = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.A ^= context.operand;
    system.registers.N = isNegativeBitSet(system.registers.A);
    system.registers.Z = isZero(system.registers.A);
  });
};

OpCodes.INC = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const result = toByte(context.operand + 1);
    system.registers.N = isNegativeBitSet(result);
    system.registers.Z = isZero(result);
    context.operand = result;
  });
};

OpCodes.INX = (system) => {
  const result = toByte(system.registers.X + 1);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  system.registers.X = result;
};

OpCodes.INY = (system) => {
  const result = toByte(system.registers.Y + 1);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  system.registers.Y = result;
};

OpCodes.JMP = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.PC = context.operand;
  });
};

OpCodes.LDA = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.A = context.operand;
    system.registers.N = isNegativeBitSet(system.registers.A);
    system.registers.Z = isZero(system.registers.A);
  });
};

OpCodes.LDX = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.X = context.operand;
    system.registers.N = isNegativeBitSet(system.registers.X);
    system.registers.Z = isZero(system.registers.X);
  });
};

OpCodes.LDY = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.Y = context.operand;
    system.registers.N = isNegativeBitSet(system.registers.Y);
    system.registers.Z = isZero(system.registers.Y);
  });
};

OpCodes.LSR = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const result = (context.operand >> 1);
    system.registers.N = false;
    system.registers.Z = isZero(result);
    system.registers.C = isNthBitSet(context.operand, 0);

    context.operand = result;
  });
};

OpCodes.NOP = () => {};

OpCodes.ORA = (addressingMode) => (system) => {
  addressingMode(system, context => {
    system.registers.A |= context.operand;
    system.registers.N = isNegativeBitSet(system.registers.A);
    system.registers.Z = isZero(system.registers.A);
  });
};

OpCodes.ROL = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const result = toByte(context.operand << 1) + (system.registers.C ? 1 : 0);
    system.registers.N = isNthBitSet(result, 7);
    system.registers.Z = isZero(result);
    system.registers.C = isNthBitSet(context.operand, 7);

    context.operand = result;
  });
};

OpCodes.ROR = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const result = (context.operand >> 1) + (system.registers.C ? 0b10000000 : 0);
    system.registers.N = false;
    system.registers.Z = isZero(result);
    system.registers.C = isNthBitSet(context.operand, 0);

    context.operand = result;
  });
};

OpCodes.SBC = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const carryIn = system.registers.C;
    const result = ((system.registers.A - context.operand - (system.registers.C ? 0 : 1)) >>> 0);
    const carryOut = isCarryBitSet(result);
  
    system.registers.V = isOverflow(system.registers.A, context.operand, result);
    system.registers.A = toByte(result);
    system.registers.N = isNegativeBitSet(result);
    system.registers.Z = isZero(toByte(result));
    system.registers.C = carryOut;
  });
};

OpCodes.SEC = (system) => {
  system.registers.C = true;
};

OpCodes.SED = (system) => {
  system.registers.D = true;
};

OpCodes.SEI = (system) => {
  system.registers.I = true;
};

OpCodes.STA = (addressingMode) => (system) => {
  addressingMode(system, context => {
    context.operand = system.registers.A;
  });
};

OpCodes.STX = (addressingMode) => (system) => {
  addressingMode(system, context => {
    context.operand = system.registers.X;
  });
};

OpCodes.STY = (addressingMode) => (system) => {
  addressingMode(system, context => {
    context.operand = system.registers.Y;
  });
};

OpCodes.TAX = (system) => {
  system.registers.X = system.registers.A;
  system.registers.N = isNegativeBitSet(system.registers.X);
  system.registers.Z = isZero(system.registers.X);
};

OpCodes.TAY = (system) => {
  system.registers.Y = system.registers.A;
  system.registers.N = isNegativeBitSet(system.registers.Y);
  system.registers.Z = isZero(system.registers.Y);
};

OpCodes.TXA = (system) => {
  system.registers.A = system.registers.X;
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.TYA = (system) => {
  system.registers.A = system.registers.Y;
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};
