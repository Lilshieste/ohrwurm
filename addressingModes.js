const buildAddress = (lowByte, highByte) => (highByte << 8) + lowByte;

const accumulator = (system, op) => {
  const context = { operand: system.cpu.A };
  op(context);
  system.cpu.A = context.operand;
}

const immediate = (peek) => (system, op) => op({ operand: peek(system, system.cpu.PC++) });

const indirect = (peek) => (system, op) => {
	const lowByte = peek(system, system.cpu.PC);
	const highByte = peek(system, system.cpu.PC + 1);

	op({ operand: buildAddress(lowByte, highByte) });
  system.cpu.PC += 2;
};

const indexedIndirect = (peek) => (system, op) => {
  const zeroPageAddress = peek(system, system.cpu.PC);
  const zeroPageAddressWithOffset = (zeroPageAddress + system.cpu.X) & 0xFF;
	const lowByte = peek(system, zeroPageAddressWithOffset);
	const highByte = peek(system, zeroPageAddressWithOffset + 1);

	op({ operand: peek(system, buildAddress(lowByte, highByte))  });
  system.cpu.PC++;
};

const indirectIndexed = (peek) => (system, op) => {
  const zeroPageAddress = peek(system, system.cpu.PC);
	const lowByte = peek(system, zeroPageAddress);
	const highByte = peek(system, zeroPageAddress + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.cpu.Y;

	op({ operand: peek(system, targetAddress) });
  system.cpu.PC++;
};

const absolute = (peek, poke) => (system, op) => {
	const lowByte = peek(system, system.cpu.PC);
	const highByte = peek(system, system.cpu.PC + 1);
  const targetAddress = buildAddress(lowByte, highByte);
  const context = { operand: peek(system, targetAddress) };

	op(context);
  poke(system,  targetAddress, context.operand);
  system.cpu.PC += 2;
};

const absoluteX = (peek, poke) => (system, op) => {
	const lowByte = peek(system, system.cpu.PC);
	const highByte = peek(system, system.cpu.PC + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.cpu.X;
  const context = { operand: peek(system, targetAddress) };

	op(context);
  poke(system, targetAddress, context.operand);
  system.cpu.PC += 2;
};

const absoluteY = (peek) => (system, op) => {
	const lowByte = peek(system, system.cpu.PC);
	const highByte = peek(system, system.cpu.PC + 1);

	op({ operand: peek(system, buildAddress(lowByte, highByte) + system.cpu.Y) });
  system.cpu.PC += 2;
};

const relative = immediate;

const zeroPage = (peek, poke) => (system, op) => {
	const address = peek(system, system.cpu.PC);
  const targetAddress = buildAddress(address, 0x00);
  const context = { operand: peek(system, targetAddress) };

	op(context);
  poke(system, targetAddress, context.operand);
  system.cpu.PC++;
};

const zeroPageX = (peek, poke) => (system, op) => {
	const address = peek(system, system.cpu.PC);
  const targetAddress = (buildAddress(address, 0x00) + system.cpu.X) & 0xFF;
  const context = { operand: peek(system, targetAddress) };

	op(context);
  poke(system, targetAddress, context.operand);
  system.cpu.PC++;
};

const zeroPageY = (peek) => (system, op) => {
	const address = peek(system, system.cpu.PC);

	op({ operand: peek(system, (buildAddress(address, 0x00) + system.cpu.Y) & 0xFF) });
  system.cpu.PC++;
};

module.exports = {
  absolute,
  absoluteX,
  absoluteY,
  accumulator,
  immediate,
  indexedIndirect,
  indirect,
  indirectIndexed,
  relative,
  zeroPage,
  zeroPageX,
  zeroPageY,
};