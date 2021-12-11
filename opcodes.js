//
// INSTRUCTION_AddressingMode
//

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
		const carryIn = system.cpu.C;
		const result = system.cpu.A + context.operand + (system.cpu.C ? 1 : 0);
		const carryOut = isCarryBitSet(result);
	
		system.cpu.A = toByte(result);
		system.cpu.N = isNegativeBitSet(result);
		system.cpu.Z = isZero(toByte(result));
		system.cpu.C = carryOut;
		system.cpu.V = isOverflowBitSet(carryIn, carryOut);
	});
};

OpCodes.AND = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.A &= context.operand;
		system.cpu.N = isNegativeBitSet(system.cpu.A);
		system.cpu.Z = isZero(system.cpu.A);
	});
};

OpCodes.ASL = (addressingMode) => (system) => {
	addressingMode(system, context => {
		const result = toByte(context.operand << 1);
		system.cpu.N = isNthBitSet(result, 7);
		system.cpu.Z = isZero(result);
		system.cpu.C = isNthBitSet(context.operand, 7);

		context.operand = result;
	});
};

OpCodes.BCC = (addressingMode) => (system) => {
	addressingMode(system, context => {
		if(!system.cpu.C) {
			system.cpu.PC += context.operand;
		}
	});
};

OpCodes.BCS = (addressingMode) => (system) => {
	addressingMode(system, context => {
		if(system.cpu.C) {
			system.cpu.PC += context.operand;
		}
	});
};

OpCodes.BEQ = (addressingMode) => (system) => {
	addressingMode(system, context => {
		if(system.cpu.Z) {
			system.cpu.PC += context.operand;
		}
	});
};

OpCodes.BIT = (addressingMode) => (system) => {
	addressingMode(system, context => {
		const result = system.cpu.A & context.operand;
		system.cpu.Z = isZero(result);
		system.cpu.N = isNegativeBitSet(result);
		system.cpu.V = isNthBitSet(result, 6);
	});
};

OpCodes.BMI = (addressingMode) => (system) => {
	addressingMode(system, context => {
		if(system.cpu.N) {
			system.cpu.PC += context.operand;
		}
	});
};

OpCodes.BNE = (addressingMode) => (system) => {
	addressingMode(system, context => {
		if(!system.cpu.Z) {
			system.cpu.PC += context.operand;
		}
	});
};

OpCodes.BPL = (addressingMode) => (system) => {
	addressingMode(system, context => {
		if(!system.cpu.N) {
			system.cpu.PC += context.operand;
		}
	});
};

OpCodes.BRK = (system) => {
	system.cpu.B = true;
};

OpCodes.BVC = (addressingMode) => (system) => {
	addressingMode(system, context => {
		if(!system.cpu.V) {
			system.cpu.PC += context.operand;
		}
	});
};

OpCodes.BVS = (addressingMode) => (system) => {
	addressingMode(system, context => {
		if(system.cpu.V) {
			system.cpu.PC += context.operand;
		}
	});
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

OpCodes.CMP = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.C = system.cpu.A >= context.operand;
		system.cpu.N = system.cpu.A < context.operand;
		system.cpu.Z = system.cpu.A === context.operand;
	});
};

OpCodes.CPX = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.C = system.cpu.X >= context.operand;
		system.cpu.N = system.cpu.X < context.operand;
		system.cpu.Z = system.cpu.X === context.operand;
	});
};

OpCodes.CPY = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.C = system.cpu.Y >= context.operand;
		system.cpu.N = system.cpu.Y < context.operand;
		system.cpu.Z = system.cpu.Y === context.operand;
	});
};

OpCodes.DEC = (addressingMode) => (system) => {
	addressingMode(system, context => {
		const result = toByte((context.operand - 1) >>> 0);
		system.cpu.N = isNegativeBitSet(result);
		system.cpu.Z = isZero(result);
		context.operand = result;
	});
};

OpCodes.DEX = (system) => {
	const result = toByte((system.cpu.X - 1) >>> 0);
	system.cpu.N = isNegativeBitSet(result);
	system.cpu.Z = isZero(result);
	system.cpu.X = result;
};

OpCodes.DEY = (system) => {
	const result = toByte((system.cpu.Y - 1) >>> 0);
	system.cpu.N = isNegativeBitSet(result);
	system.cpu.Z = isZero(result);
	system.cpu.Y = result;
};

OpCodes.EOR = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.A ^= context.operand;
		system.cpu.N = isNegativeBitSet(system.cpu.A);
		system.cpu.Z = isZero(system.cpu.A);
	});
};

OpCodes.INC = (addressingMode) => (system) => {
	addressingMode(system, context => {
		const result = toByte(context.operand + 1);
		system.cpu.N = isNegativeBitSet(result);
		system.cpu.Z = isZero(result);
		context.operand = result;
	});
};

OpCodes.INX = (system) => {
	const result = toByte(system.cpu.X + 1);
	system.cpu.N = isNegativeBitSet(result);
	system.cpu.Z = isZero(result);
	system.cpu.X = result;
};

OpCodes.INY = (system) => {
	const result = toByte(system.cpu.Y + 1);
	system.cpu.N = isNegativeBitSet(result);
	system.cpu.Z = isZero(result);
	system.cpu.Y = result;
};

OpCodes.JMP = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.PC = context.operand;
	});
};

OpCodes.LDA = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.A = context.operand;
		system.cpu.N = isNegativeBitSet(system.cpu.A);
		system.cpu.Z = isZero(system.cpu.A);
	});
};

OpCodes.LDX = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.X = context.operand;
		system.cpu.N = isNegativeBitSet(system.cpu.X);
		system.cpu.Z = isZero(system.cpu.X);
	});
};

OpCodes.LDY = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.Y = context.operand;
		system.cpu.N = isNegativeBitSet(system.cpu.Y);
		system.cpu.Z = isZero(system.cpu.Y);
	});
};

OpCodes.LSR = (addressingMode) => (system) => {
	addressingMode(system, context => {
		const result = (context.operand >> 1);
		system.cpu.N = false;
		system.cpu.Z = isZero(result);
		system.cpu.C = isNthBitSet(context.operand, 0);

		context.operand = result;
	});
};

OpCodes.NOP = () => {};

OpCodes.ORA = (addressingMode) => (system) => {
	addressingMode(system, context => {
		system.cpu.A |= context.operand;
		system.cpu.N = isNegativeBitSet(system.cpu.A);
		system.cpu.Z = isZero(system.cpu.A);
	});
};

OpCodes.ROL = (addressingMode) => (system) => {
	addressingMode(system, context => {
		const result = toByte(context.operand << 1) + (system.cpu.C ? 1 : 0);
		system.cpu.N = isNthBitSet(result, 7);
		system.cpu.Z = isZero(result);
		system.cpu.C = isNthBitSet(context.operand, 7);

		context.operand = result;
	});
};

OpCodes.ROR = (addressingMode) => (system) => {
	addressingMode(system, context => {
		const result = (context.operand >> 1) + (system.cpu.C ? 0b10000000 : 0);
		system.cpu.N = false;
		system.cpu.Z = isZero(result);
		system.cpu.C = isNthBitSet(context.operand, 0);

		context.operand = result;
	});
};

OpCodes.SBC = (addressingMode) => (system) => {
	addressingMode(system, context => {
		const carryIn = system.cpu.C;
		const result = ((system.cpu.A - context.operand - (system.cpu.C ? 0 : 1)) >>> 0);
		const carryOut = isCarryBitSet(result);
	
		system.cpu.V = isOverflow(system.cpu.A, context.operand, result);
		system.cpu.A = toByte(result);
		system.cpu.N = isNegativeBitSet(result);
		system.cpu.Z = isZero(toByte(result));
		system.cpu.C = carryOut;
	});
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

OpCodes.STA = (addressingMode) => (system) => {
	addressingMode(system, context => {
		context.operand = system.cpu.A;
	});
};

OpCodes.STX = (addressingMode) => (system) => {
	addressingMode(system, context => {
		context.operand = system.cpu.X;
	});
};

OpCodes.STY = (addressingMode) => (system) => {
	addressingMode(system, context => {
		context.operand = system.cpu.Y;
	});
};

OpCodes.TAX = (system) => {
	system.cpu.X = system.cpu.A;
	system.cpu.N = isNegativeBitSet(system.cpu.X);
	system.cpu.Z = isZero(system.cpu.X);
};

OpCodes.TAY = (system) => {
	system.cpu.Y = system.cpu.A;
	system.cpu.N = isNegativeBitSet(system.cpu.Y);
	system.cpu.Z = isZero(system.cpu.Y);
};

OpCodes.TXA = (system) => {
	system.cpu.A = system.cpu.X;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};

OpCodes.TYA = (system) => {
	system.cpu.A = system.cpu.Y;
	system.cpu.N = isNegativeBitSet(system.cpu.A);
	system.cpu.Z = isZero(system.cpu.A);
};
