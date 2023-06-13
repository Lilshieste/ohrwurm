const {
  buildStatusByte,
  splitAddress, 
  loadStatusByte,
  buildAddress} = require('./memory');
const {
  isNthBitSet,
  isOverflow,
  isNegativeBitSet, 
  isCarryBitSet,
  isZero,
  onesComplement,
  toByte } = require('./util');

const OpCodes = module.exports;

OpCodes.NotImplemented = () => { throw new Error(`This opcode hasn't been implemented yet`); }
OpCodes.Unofficial = OpCodes.NotImplemented;

OpCodes.ADC = (addressingMode) => (system) => {
  const operand = addressingMode(system).read();
  const result = system.registers.A + operand + (system.registers.C ? 1 : 0);
  const carryOut = isCarryBitSet(result);

  system.registers.V = isOverflow(system.registers.A, result, operand);
  system.registers.A = toByte(result);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(toByte(result));
  system.registers.C = carryOut;
};

OpCodes.AND = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  system.registers.A &= operand.read();
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.ASL = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  const result = toByte(operand.read() << 1);
  system.registers.N = isNthBitSet(result, 7);
  system.registers.Z = isZero(result);
  system.registers.C = isNthBitSet(operand.read(), 7);

  operand.write(result);
};

OpCodes.BCC = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  if(!system.registers.C) {
    system.registers.PC += operand.read();
  }
};

OpCodes.BCS = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  if(system.registers.C) {
    system.registers.PC += operand.read();
  }
};

OpCodes.BEQ = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  if(system.registers.Z) {
    system.registers.PC += operand.read();
  }
};

OpCodes.BIT = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  const result = system.registers.A & operand.read();
  system.registers.Z = isZero(result);
  system.registers.N = isNegativeBitSet(result);
  system.registers.V = isNthBitSet(result, 6);
};

OpCodes.BMI = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  if(system.registers.N) {
    system.registers.PC += operand.read();
  }
};

OpCodes.BNE = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  if(!system.registers.Z) {
    system.registers.PC += operand.read();
  }
};

OpCodes.BPL = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  if(!system.registers.N) {
    system.registers.PC += operand.read();
  }
};

OpCodes.BRK = (/* IMPLIED addressing mode */) => (system) => {
  const isrLowByte = system.peek(system.memory, 0xFFFE);
  const isrHighByte = system.peek(system.memory, 0xFFFF);

  // PC + 1 because BRK instructions are 2 bytes even though only the first byte is typically used
  const { lowByte: pcLowByte, highByte: pcHighByte } = splitAddress(system.registers.PC + 1);
  
  system.registers.B = true;

  system.push(system.memory, system.registers, pcHighByte);
  system.push(system.memory, system.registers, pcLowByte);
  system.push(system.memory, system.registers, buildStatusByte(system.registers));

  system.registers.PC = buildAddress(isrLowByte, isrHighByte);
  system.registers.I = true;
};

OpCodes.BVC = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  if(!system.registers.V) {
    system.registers.PC += operand.read();
  }
};

OpCodes.BVS = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  if(system.registers.V) {
    system.registers.PC += operand.read();
  }
};

OpCodes.CLC = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.C = false;
};

OpCodes.CLD = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.D = false;
};

OpCodes.CLI = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.I = false;
};

OpCodes.CLV = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.V = false;
};

OpCodes.CMP = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  system.registers.C = system.registers.A >= operand.read();
  system.registers.N = system.registers.A < operand.read();
  system.registers.Z = system.registers.A === operand.read();
};

OpCodes.CPX = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  system.registers.C = system.registers.X >= operand.read();
  system.registers.N = system.registers.X < operand.read();
  system.registers.Z = system.registers.X === operand.read();
};

OpCodes.CPY = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  system.registers.C = system.registers.Y >= operand.read();
  system.registers.N = system.registers.Y < operand.read();
  system.registers.Z = system.registers.Y === operand.read();
};

OpCodes.DEC = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  const result = toByte((operand.read() - 1) >>> 0);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  operand.write(result);
};

OpCodes.DEX = (/* IMPLIED addressing mode */) => (system) => {
  const result = toByte((system.registers.X - 1) >>> 0);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  system.registers.X = result;
};

OpCodes.DEY = (/* IMPLIED addressing mode */) => (system) => {
  const result = toByte((system.registers.Y - 1) >>> 0);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  system.registers.Y = result;
};

OpCodes.EOR = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  system.registers.A ^= operand.read();
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.INC = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  const result = toByte(operand.read() + 1);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);

  operand.write(result);
};

OpCodes.INX = (/* IMPLIED addressing mode */) => (system) => {
  const result = toByte(system.registers.X + 1);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  system.registers.X = result;
};

OpCodes.INY = (/* IMPLIED addressing mode */) => (system) => {
  const result = toByte(system.registers.Y + 1);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(result);
  system.registers.Y = result;
};

OpCodes.JMP = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  system.registers.PC = operand.read();
};

OpCodes.JSR = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  const targetAddress = operand.read();
  const { lowByte, highByte } = splitAddress(system.registers.PC);
  system.push(system.memory, system.registers, highByte);
  system.push(system.memory, system.registers, lowByte);
  system.registers.PC = targetAddress;
};

OpCodes.LDA = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  system.registers.A = operand.read();
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.LDX = (addressingMode) => (system) => {
  const operand = addressingMode(system);

  system.registers.X = operand.read();
  system.registers.N = isNegativeBitSet(system.registers.X);
  system.registers.Z = isZero(system.registers.X);
};

OpCodes.LDY = (addressingMode) => (system) => {
  const operand = addressingMode(system);

  system.registers.Y = operand.read();
  system.registers.N = isNegativeBitSet(system.registers.Y);
  system.registers.Z = isZero(system.registers.Y);
};

OpCodes.LSR = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  const result = (operand.read() >> 1);
  system.registers.N = false;
  system.registers.Z = isZero(result);
  system.registers.C = isNthBitSet(operand.read(), 0);

  operand.write(result);
};

OpCodes.NOP = (/* IMPLIED addressing mode */) => () => {};

OpCodes.ORA = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  system.registers.A |= operand.read();
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.PHA = (/* IMPLIED addressing mode */) => (system) => system.push(system.memory, system.registers, system.registers.A);

OpCodes.PHP = (/* IMPLIED addressing mode */) => (system) => {
  const status = {
    ...system.registers,
    B: true,
  }
  system.push(system.memory, system.registers, buildStatusByte(status));
};

OpCodes.PLA = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.A = system.pull(system.memory, system.registers);
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.PLP = (/* IMPLIED addressing mode */) => (system) => {
  const originalB = system.registers.B;
  loadStatusByte(system.registers, system.pull(system.memory, system.registers));
  system.registers.B = originalB;
}

OpCodes.ROL = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  const result = toByte(operand.read() << 1) + (system.registers.C ? 1 : 0);
  system.registers.N = isNthBitSet(operand.read(), 6);
  system.registers.Z = isZero(result);
  system.registers.C = isNthBitSet(operand.read(), 7);

  operand.write(result);
};

OpCodes.ROR = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  const result = (operand.read() >> 1) + (system.registers.C ? 0b10000000 : 0);
  system.registers.N = system.registers.C;
  system.registers.Z = isZero(result);
  system.registers.C = isNthBitSet(operand.read(), 0);

  operand.write(result);
};

OpCodes.RTI = (/* IMPLIED addressing mode */) => (system) => {
  const originalB = system.registers.B;
  loadStatusByte(system.registers, system.pull(system.memory, system.registers));
  system.registers.PC = buildAddress(system.pull(system.memory, system.registers), system.pull(system.memory, system.registers));
  system.registers.B = originalB;
};

OpCodes.RTS = (/* IMPLIED addressing mode */) => (system) => {
  const lowByte = system.pull(system.memory, system.registers);
  const highByte = system.pull(system.memory, system.registers);
  const address = buildAddress(lowByte, highByte);
  system.registers.PC = address;
};

OpCodes.SBC = (addressingMode) => (system) => {
  const operand = onesComplement(addressingMode(system).read());
  const result = system.registers.A + operand + (system.registers.C ? 1 : 0);
  const carryOut = isCarryBitSet(result);

  system.registers.V = isOverflow(system.registers.A, result, operand);
  system.registers.A = toByte(result);
  system.registers.N = isNegativeBitSet(result);
  system.registers.Z = isZero(toByte(result));
  system.registers.C = carryOut;
};

OpCodes.SEC = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.C = true;
};

OpCodes.SED = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.D = true;
};

OpCodes.SEI = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.I = true;
};

OpCodes.STA = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  operand.write(system.registers.A);
};

OpCodes.STX = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  operand.write(system.registers.X);
};

OpCodes.STY = (addressingMode) => (system) => {
  const operand = addressingMode(system);
  operand.write(system.registers.Y);
};

OpCodes.TAX = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.X = system.registers.A;
  system.registers.N = isNegativeBitSet(system.registers.X);
  system.registers.Z = isZero(system.registers.X);
};

OpCodes.TAY = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.Y = system.registers.A;
  system.registers.N = isNegativeBitSet(system.registers.Y);
  system.registers.Z = isZero(system.registers.Y);
};

OpCodes.TSX = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.X = system.registers.SP;
  system.registers.N = isNegativeBitSet(system.registers.X);
  system.registers.Z = isZero(system.registers.X);
};

OpCodes.TXA = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.A = system.registers.X;
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};

OpCodes.TXS = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.SP = system.registers.X;
};

OpCodes.TYA = (/* IMPLIED addressing mode */) => (system) => {
  system.registers.A = system.registers.Y;
  system.registers.N = isNegativeBitSet(system.registers.A);
  system.registers.Z = isZero(system.registers.A);
};
