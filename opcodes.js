const {
  buildStatusByte,
  pull,
  push,
  splitAddress, 
  loadStatusByte,
  buildAddress} = require('./memory');
const {
  isNthBitSet,
  isOverflowBitSet,
  isOverflow,
  isNegativeBitSet, 
  isCarryBitSet,
  isZero,
  toByte } = require('./util');

// TODO: Consider returning new operand from addressingMode callback instead of overwriting parameter
//  (Wait until all opcodes are implemented, to make sure there isn't a lurking reason to NOT do this)

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

OpCodes.BRK = (peek, push) => (system) => {
  const isrLowByte = peek(system.memory, 0xFFFE);
  const isrHighByte = peek(system.memory, 0xFFFF);
  const { lowByte: pcLowByte, highByte: pcHighByte } = splitAddress(system.registers.PC);
  
  system.registers.B = true;

  push(system.memory, system.registers, pcHighByte);
  push(system.memory, system.registers, pcLowByte);
  push(system.memory, system.registers, buildStatusByte(system.registers));

  system.registers.PC = buildAddress(isrLowByte, isrHighByte);
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

OpCodes.JSR = (addressingMode) => (system) => {
  addressingMode(system, context => {
    const { lowByte, highByte } = splitAddress(system.registers.PC - 1);
    push(system.memory, system.registers, highByte);
    push(system.memory, system.registers, lowByte);
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

OpCodes.PHA = (system) => push(system.memory, system.registers, system.registers.A);

OpCodes.PHP = (system) => push(system.memory, system.registers, buildStatusByte(system.registers));

OpCodes.PLA = (system) => {
  system.registers.A = pull(system.memory, system.registers);
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.PLP = (system) => loadStatusByte(system.registers, pull(system.memory, system.registers));

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

OpCodes.RTI = (pull) => (system) => {
  loadStatusByte(system.registers, pull(system.memory, system.registers));
  system.registers.PC = buildAddress(pull(system.memory, system.registers), pull(system.memory, system.registers));
};

OpCodes.RTS = (pull) => (system) => {
  system.registers.PC = buildAddress(pull(system.memory, system.registers), pull(system.memory, system.registers));
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

OpCodes.TSX = (system) => {
  system.registers.X = system.registers.SP;
  system.registers.N = isNegativeBitSet(system.registers.X);
  system.registers.Z = isZero(system.registers.X);
};

OpCodes.TXA = (system) => {
  system.registers.A = system.registers.X;
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.TXS = (system) => {
  system.registers.SP = system.registers.X;
};

OpCodes.TYA = (system) => {
  system.registers.A = system.registers.Y;
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};
