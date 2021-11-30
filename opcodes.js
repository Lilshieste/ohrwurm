//
// INSTRUCTION_AddressingMode
//

const isNegativeBitSet = (val) => Boolean(val & 0b10000000);
const isZero = (val) => val === 0;

const OpCodes = module.exports;

OpCodes.NotImplemented = () => { throw new Error(`This opcode hasn't been implemented yet`); }
OpCodes.Unofficial = OpCodes.NotImplemented;

OpCodes.BR = (system) => {
	system.cpu.B = true;
};

OpCodes.AND = (addressingMode) => (system) => {
	const operand = addressingMode(system);
	system.cpu.A &= operand;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};
