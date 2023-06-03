const { buildAddress } = require('./memory');

class Operand {
  constructor({ read, write, onOperandRead, onOperandWrite }) {
    this.onRead = onOperandRead;
    this.onWrite = onOperandWrite;

    this.read = () => {
      const result = read();
      if(this.onRead)
        this.onRead(result);
      return result;
    };
    this.write = (value) => {
      write(value);
      if(this.onWrite)
        this.onWrite(value);
    };
  }
};

//
// All Addressing Modes have the signature: (peek, poke) => (system, op)
//

const implied = (/* peek, poke */) => (/* system, op */) => {};

const accumulator = (options = {}) => (system) => {
  return new Operand({
    read: () => system.registers.A, 
    write: (val) => system.registers.A = val,
    ...options,
  });
}

const immediate = (peek, poke, options = {}) => (system) => {
  const address = system.registers.PC++;
  const value = peek(system.memory, address);
  return new Operand({
    read: () => value, 
    write: (val) => poke(system.memory, address, val),
    ...options,
  });
};

const indirect = (peek, poke, options = {}) => (system) => {
  const lowByte = peek(system.memory, system.registers.PC++);
  const highByte = peek(system.memory, system.registers.PC++);
  const address = buildAddress(lowByte, highByte);
  const targetLowByte = peek(system.memory, address);
  const targetHighByte = peek(system.memory, address + 1);
  const value = buildAddress(targetLowByte, targetHighByte);
  return new Operand({
    read: () => value,
    ...options,
  });
};

const indexedIndirect = (peek, poke, options = {}) => (system) => {
  const zeroPageAddress = peek(system.memory, system.registers.PC++);
  const zeroPageAddressWithOffset = (zeroPageAddress + system.registers.X) & 0xFF;
  const lowByte = peek(system.memory, zeroPageAddressWithOffset);
  const highByte = peek(system.memory, zeroPageAddressWithOffset + 1);
  const targetAddress = buildAddress(lowByte, highByte);
  const value = peek(system.memory, targetAddress);
  return new Operand({
    read: () => value,
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

const indirectIndexed = (peek, poke, options = {}) => (system) => {
  const zeroPageAddress = peek(system.memory, system.registers.PC++);
  const lowByte = peek(system.memory, zeroPageAddress);
  const highByte = peek(system.memory, zeroPageAddress + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;
  return new Operand({
    read: () => peek(system.memory, targetAddress),
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

const fetchAbsoluteAddress = (peek) => (system) => {
  const lowByte = peek(system.memory, system.registers.PC++);
  const highByte = peek(system.memory, system.registers.PC++);
  return buildAddress(lowByte, highByte);
};

const absolute_address = (peek, poke, options = {}) => (system) => {
  const targetAddress = fetchAbsoluteAddress(peek)(system);
  return new Operand({
    read: () => targetAddress,
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

const absolute = (peek, poke, options = {}) => (system) => {
  const targetAddress = fetchAbsoluteAddress(peek)(system);
  return new Operand({
    read: () => peek(system.memory, targetAddress),
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

const absoluteX = (peek, poke, options = {}) => (system) => {
  const lowByte = peek(system.memory, system.registers.PC++);
  const highByte = peek(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.X;
  return new Operand({
    read: () => peek(system.memory, targetAddress),
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

const absoluteY = (peek, poke, options = {}) => (system) => {
  const lowByte = peek(system.memory, system.registers.PC++);
  const highByte = peek(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;
  return new Operand({
    read: () => peek(system.memory, targetAddress),
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

const relative = immediate;

const zeroPage = (peek, poke, options = {}) => (system) => {
  const address = peek(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(address, 0x00);
  return new Operand({
    read: () => peek(system.memory, targetAddress),
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

const zeroPageX = (peek, poke, options = {}) => (system) => {
  const address = peek(system.memory, system.registers.PC++);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.X) & 0xFF;
  return new Operand({
    read: () => peek(system.memory, targetAddress),
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

const zeroPageY = (peek, poke, options = {}) => (system) => {
  const address = peek(system.memory, system.registers.PC++);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.Y) & 0xFF;
  return new Operand({
    read: () => peek(system.memory, targetAddress),
    write: (val) => poke(system.memory, targetAddress, val),
    ...options,
  });
};

module.exports = {
  absolute,
  absolute_address,
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