const { buildAddress } = require('./memory');

const accumulator = (system, op) => {
  const context = { operand: system.registers.A };
  op(context);
  system.registers.A = context.operand;
}

const immediate = (peek) => (system, op) => op({ operand: peek(system, system.registers.PC++) });

const indirect = (peek) => (system, op) => {
  const lowByte = peek(system, system.registers.PC);
  const highByte = peek(system, system.registers.PC + 1);

  op({ operand: buildAddress(lowByte, highByte) });
  system.registers.PC += 2;
};

const indexedIndirect = (peek) => (system, op) => {
  const zeroPageAddress = peek(system, system.registers.PC);
  const zeroPageAddressWithOffset = (zeroPageAddress + system.registers.X) & 0xFF;
  const lowByte = peek(system, zeroPageAddressWithOffset);
  const highByte = peek(system, zeroPageAddressWithOffset + 1);

  op({ operand: peek(system, buildAddress(lowByte, highByte))  });
  system.registers.PC++;
};

const indirectIndexed = (peek) => (system, op) => {
  const zeroPageAddress = peek(system, system.registers.PC);
  const lowByte = peek(system, zeroPageAddress);
  const highByte = peek(system, zeroPageAddress + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;

  op({ operand: peek(system, targetAddress) });
  system.registers.PC++;
};

const absolute = (peek, poke) => (system, op) => {
  const lowByte = peek(system, system.registers.PC);
  const highByte = peek(system, system.registers.PC + 1);
  const targetAddress = buildAddress(lowByte, highByte);
  const context = { operand: peek(system, targetAddress) };

  op(context);
  poke(system,  targetAddress, context.operand);
  system.registers.PC += 2;
};

const absoluteX = (peek, poke) => (system, op) => {
  const lowByte = peek(system, system.registers.PC);
  const highByte = peek(system, system.registers.PC + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.X;
  const context = { operand: peek(system, targetAddress) };

  op(context);
  poke(system, targetAddress, context.operand);
  system.registers.PC += 2;
};

const absoluteY = (peek) => (system, op) => {
  const lowByte = peek(system, system.registers.PC);
  const highByte = peek(system, system.registers.PC + 1);

  op({ operand: peek(system, buildAddress(lowByte, highByte) + system.registers.Y) });
  system.registers.PC += 2;
};

const relative = immediate;

const zeroPage = (peek, poke) => (system, op) => {
  const address = peek(system, system.registers.PC);
  const targetAddress = buildAddress(address, 0x00);
  const context = { operand: peek(system, targetAddress) };

  op(context);
  poke(system, targetAddress, context.operand);
  system.registers.PC++;
};

const zeroPageX = (peek, poke) => (system, op) => {
  const address = peek(system, system.registers.PC);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.X) & 0xFF;
  const context = { operand: peek(system, targetAddress) };

  op(context);
  poke(system, targetAddress, context.operand);
  system.registers.PC++;
};

const zeroPageY = (peek) => (system, op) => {
  const address = peek(system, system.registers.PC);

  op({ operand: peek(system, (buildAddress(address, 0x00) + system.registers.Y) & 0xFF) });
  system.registers.PC++;
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