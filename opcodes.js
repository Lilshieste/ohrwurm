//
// INSTRUCTION_AddressingMode
//

const isOverflowBitSet = (carryIn, carryOut) => Boolean(carryIn ^ carryOut);
const isNegativeBitSet = (byte) => Boolean(byte & 0b10000000);
const isCarryBitSet = (byte) => Boolean(byte & 0b100000000);
const isZero = (byte) => byte === 0;
const toByte = (val) => val & 0xFF;

const OpCodes = module.exports;

OpCodes.NotImplemented = () => { throw new Error(`This opcode hasn't been implemented yet`); }
OpCodes.Unofficial = OpCodes.NotImplemented;

OpCodes.ADC = (addressingMode) => (system) => {
	const operand = addressingMode(system);
	const carryIn = system.cpu.C;
	const result = system.cpu.A + operand + (system.cpu.C ? 1 : 0);
	const carryOut = isCarryBitSet(result);

	system.cpu.A = toByte(result);
	system.cpu.N = isNegativeBitSet(result);
	system.cpu.Z = isZero(toByte(result));
	system.cpu.C = carryOut;
	system.cpu.V = isOverflowBitSet(carryIn, carryOut);
};

OpCodes.AND = (addressingMode) => (system) => {
	const operand = addressingMode(system);
	system.cpu.A &= operand;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};

OpCodes.BR = (system) => {
	system.cpu.B = true;
};

OpCodes.CLC = (system) => {
	system.cpu.C = false;
};

OpCodes.CLD = (system) => {
	system.cpu.D = false;
};

OpCodes.CLI = (system) => {
	system.cpu.I = false;
};

OpCodes.CLV = (system) => {
	system.cpu.V = false;
};

OpCodes.SEC = (system) => {
	system.cpu.C = true;
};

OpCodes.SED = (system) => {
	system.cpu.D = true;
};

OpCodes.SEI = (system) => {
	system.cpu.I = true;
};
