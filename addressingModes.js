const { buildAddress } = require('./memory');

//
// All Addressing Modes have the signature: (peek, poke) => (system, op)
//

const implied = (/* peek, poke */) => (/* system, op */) => {};

const accumulator = (system, op) => {
  const context = { operand: system.registers.A };
  op(context);
  system.registers.A = context.operand;
}

const immediate = (peek) => (system, op) => op({ operand: peek(system.memory, system.registers.PC++) });

const indirect = (peek) => (system, op) => {
  const lowByte = peek(system.memory, system.registers.PC);
  const highByte = peek(system.memory, system.registers.PC + 1);

  const operand = buildAddress(lowByte, highByte);
  const context = { operand };
  op(context);
  system.registers.PC += 2;
};

const indexedIndirect = (peek, poke) => (system, op) => {
  const zeroPageAddress = peek(system.memory, system.registers.PC);
  const zeroPageAddressWithOffset = (zeroPageAddress + system.registers.X) & 0xFF;
  const lowByte = peek(system.memory, zeroPageAddressWithOffset);
  const highByte = peek(system.memory, zeroPageAddressWithOffset + 1);
  const targetAddress = buildAddress(lowByte, highByte);
  const operand = peek(system.memory, targetAddress);
  const context = { operand };

  op(context);
  poke(system.memory, targetAddress, context.operand);
  system.registers.PC++;
};

const indirectIndexed = (peek, poke) => (system, op) => {
  const zeroPageAddress = peek(system.memory, system.registers.PC);
  const lowByte = peek(system.memory, zeroPageAddress);
  const highByte = peek(system.memory, zeroPageAddress + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;
  const context = { operand: peek(system.memory, targetAddress) };

  op(context);
  poke(system.memory, targetAddress, context.operand);
  system.registers.PC++;
};

const absolute = (peek, poke) => (system, op) => {
  const lowByte = peek(system.memory, system.registers.PC);
  const highByte = peek(system.memory, system.registers.PC + 1);
  const targetAddress = buildAddress(lowByte, highByte);
  const operand = peek(system.memory, targetAddress);
  const context = { operand };

  op(context);
  poke(system.memory, targetAddress, context.operand);
  system.registers.PC += 2;
};

const absoluteX = (peek, poke) => (system, op) => {
  const lowByte = peek(system.memory, system.registers.PC);
  const highByte = peek(system.memory, system.registers.PC + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.X;
  const context = { operand: peek(system.memory, targetAddress) };

  op(context);
  poke(system.memory, targetAddress, context.operand);
  system.registers.PC += 2;
};

const absoluteY = (peek, poke) => (system, op) => {
  const lowByte = peek(system.memory, system.registers.PC);
  const highByte = peek(system.memory, system.registers.PC + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;
  const operand = peek(system.memory, targetAddress);
  const context = { operand };

  op(context);
  poke(system.memory, targetAddress, context.operand);
  system.registers.PC += 2;
};

const relative = immediate;

const zeroPage = (peek, poke) => (system, op) => {
  const address = peek(system.memory, system.registers.PC);
  const targetAddress = buildAddress(address, 0x00);
  const context = { operand: peek(system.memory, targetAddress) };

  op(context);
  poke(system.memory, targetAddress, context.operand);
  system.registers.PC++;
};

const zeroPageX = (peek, poke) => (system, op) => {
  const address = peek(system.memory, system.registers.PC);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.X) & 0xFF;
  const context = { operand: peek(system.memory, targetAddress) };

  op(context);
  poke(system.memory, targetAddress, context.operand);
  system.registers.PC++;
};

const zeroPageY = (peek, poke) => (system, op) => {
  const address = peek(system.memory, system.registers.PC);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.Y) & 0xFF;
  const operand = peek(system.memory, targetAddress);
  const context = { operand };

  op(context);
  poke(system.memory, targetAddress, context.operand);
  system.registers.PC++;
};

module.exports = {
  absolute,
  absoluteX,
  absoluteY,
  accumulator,
  immediate,
  implied,
  indexedIndirect,
  indirect,
  indirectIndexed,
  relative,
  zeroPage,
  zeroPageX,
  zeroPageY,
};