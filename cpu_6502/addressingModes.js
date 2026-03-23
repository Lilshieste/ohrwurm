const { buildAddress } = require('./memory');

class Operand {
  constructor({ read, write, options = {} }) {
    this.onRead = options?.onOperandRead;
    this.onWrite = options?.onOperandWrite;

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

const implied = (/* system, op */) => {};

const accumulator = (system) => {
  return new Operand({
    read: () => system.registers.A, 
    write: (val) => system.registers.A = val,
    options: system.options,
  });
}

const immediate = (system) => {
  const address = system.registers.PC++;
  const value = system.peek(system.memory, address);
  return new Operand({
    read: () => value, 
    write: (val) => system.poke(system.memory, address, val),
    options: system.options,
  });
};

const indirect = (system) => {
  const lowByte = system.peek(system.memory, system.registers.PC++);
  const highByte = system.peek(system.memory, system.registers.PC++);
  const address = buildAddress(lowByte, highByte);
  const targetLowByte = system.peek(system.memory, address);
  const targetHighByte = system.peek(system.memory, address + 1);
  const value = buildAddress(targetLowByte, targetHighByte);
  return new Operand({
    read: () => value,
    options: system.options,
  });
};

const indexedIndirect = (system) => {
  const zeroPageAddress = system.peek(system.memory, system.registers.PC++);
  const zeroPageAddressWithOffset = (zeroPageAddress + system.registers.X) & 0xFF;
  const lowByte = system.peek(system.memory, zeroPageAddressWithOffset);
  const highByte = system.peek(system.memory, zeroPageAddressWithOffset + 1);
  const targetAddress = buildAddress(lowByte, highByte);
  const value = system.peek(system.memory, targetAddress);
  return new Operand({
    read: () => value,
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
  });
};

const indirectIndexed = (system) => {
  const zeroPageAddress = system.peek(system.memory, system.registers.PC++);
  const lowByte = system.peek(system.memory, zeroPageAddress);
  const highByte = system.peek(system.memory, zeroPageAddress + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;
  return new Operand({
    read: () => system.peek(system.memory, targetAddress),
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
  });
};

const fetchAbsoluteAddress = (system) => {
  const lowByte = system.peek(system.memory, system.registers.PC++);
  const highByte = system.peek(system.memory, system.registers.PC++);
  return buildAddress(lowByte, highByte);
};

const absolute_address = (system) => {
  const targetAddress = fetchAbsoluteAddress(system);
  return new Operand({
    read: () => targetAddress,
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
  });
};

const absolute = (system) => {
  const targetAddress = fetchAbsoluteAddress(system);
  return new Operand({
    read: () => system.peek(system.memory, targetAddress),
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
  });
};

const absoluteX = (system) => {
  const lowByte = system.peek(system.memory, system.registers.PC++);
  const highByte = system.peek(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.X;
  return new Operand({
    read: () => system.peek(system.memory, targetAddress),
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
  });
};

const absoluteY = (system) => {
  const lowByte = system.peek(system.memory, system.registers.PC++);
  const highByte = system.peek(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;
  return new Operand({
    read: () => system.peek(system.memory, targetAddress),
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
  });
};

const relative = immediate;

const zeroPage = (system) => {
  const address = system.peek(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(address, 0x00);
  return new Operand({
    read: () => system.peek(system.memory, targetAddress),
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
  });
};

const zeroPageX = (system) => {
  const address = system.peek(system.memory, system.registers.PC++);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.X) & 0xFF;
  return new Operand({
    read: () => system.peek(system.memory, targetAddress),
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
  });
};

const zeroPageY = (system) => {
  const address = system.peek(system.memory, system.registers.PC++);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.Y) & 0xFF;
  return new Operand({
    read: () => system.peek(system.memory, targetAddress),
    write: (val) => system.poke(system.memory, targetAddress, val),
    options: system.options,
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