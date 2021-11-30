const { readFromMemory } = require('./memory');

//
// INSTRUCTION_AddressingMode
//

const isNegativeBitSet = (val) => Boolean(val & 0b10000000);
const isZero = (val) => val === 0;
const buildAddress = (lowByte, highByte) => (highByte << 8) + lowByte;

const OpCodes = module.exports;

OpCodes.BR_Implied = (system) => {
	system.cpu.B = true;
};

OpCodes.AND_Immediate = (system) => {
	const operand = readFromMemory(system.memory)(system.cpu.PC++);
	system.cpu.A &= operand;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};

OpCodes.AND_Absolute = (system) => {
	const addressLow = readFromMemory(system.memory)(system.cpu.PC++);
	const addressHigh = readFromMemory(system.memory)(system.cpu.PC++);
	const operand = readFromMemory(system.memory)(buildAddress(addressLow, addressHigh));
	system.cpu.A &= operand;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};

OpCodes.AND_AbsoluteX = (system) => {
	const addressLow = readFromMemory(system.memory)(system.cpu.PC++);
	const addressHigh = readFromMemory(system.memory)(system.cpu.PC++);
	const operand = readFromMemory(system.memory)(buildAddress(addressLow, addressHigh) + system.cpu.X);
	system.cpu.A &= operand;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};

OpCodes.AND_AbsoluteY = (system) => {
	const addressLow = readFromMemory(system.memory)(system.cpu.PC++);
	const addressHigh = readFromMemory(system.memory)(system.cpu.PC++);
	const operand = readFromMemory(system.memory)(buildAddress(addressLow, addressHigh) + system.cpu.Y);
	system.cpu.A &= operand;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};

OpCodes.AND_ZeroPage = (system) => {
	const address = readFromMemory(system.memory)(system.cpu.PC++);
	const operand = readFromMemory(system.memory)(buildAddress(address, 0x00));
	system.cpu.A &= operand;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};

OpCodes.AND_ZeroPageX = (system) => {
	const address = readFromMemory(system.memory)(system.cpu.PC++);
	const operand = readFromMemory(system.memory)(buildAddress(address + system.cpu.X, 0x00));
	system.cpu.A &= operand;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};
