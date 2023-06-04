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

const accumulator = (system) => {
  return new Operand({
    read: () => system.registers.A, 
    write: (val) => system.registers.A = val,
  });
}

const immediate = (system) => {
  const address = system.registers.PC++;
  const value = system.peekFn(system.memory, address);
  return new Operand({
    read: () => value, 
    write: (val) => system.pokeFn(system.memory, address, val),
  });
};

const indirect = (system) => {
  const lowByte = system.peekFn(system.memory, system.registers.PC++);
  const highByte = system.peekFn(system.memory, system.registers.PC++);
  const address = buildAddress(lowByte, highByte);
  const targetLowByte = system.peekFn(system.memory, address);
  const targetHighByte = system.peekFn(system.memory, address + 1);
  const value = buildAddress(targetLowByte, targetHighByte);
  return new Operand({
    read: () => value,
  });
};

const indexedIndirect = (system) => {
  const zeroPageAddress = system.peekFn(system.memory, system.registers.PC++);
  const zeroPageAddressWithOffset = (zeroPageAddress + system.registers.X) & 0xFF;
  const lowByte = system.peekFn(system.memory, zeroPageAddressWithOffset);
  const highByte = system.peekFn(system.memory, zeroPageAddressWithOffset + 1);
  const targetAddress = buildAddress(lowByte, highByte);
  const value = system.peekFn(system.memory, targetAddress);
  return new Operand({
    read: () => value,
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
  });
};

const indirectIndexed = (system) => {
  const zeroPageAddress = system.peekFn(system.memory, system.registers.PC++);
  const lowByte = system.peekFn(system.memory, zeroPageAddress);
  const highByte = system.peekFn(system.memory, zeroPageAddress + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;
  return new Operand({
    read: () => system.peekFn(system.memory, targetAddress),
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
  });
};

const fetchAbsoluteAddress = (system) => {
  const lowByte = system.peekFn(system.memory, system.registers.PC++);
  const highByte = system.peekFn(system.memory, system.registers.PC++);
  return buildAddress(lowByte, highByte);
};

const absolute_address = (system) => {
  const targetAddress = fetchAbsoluteAddress(system);
  return new Operand({
    read: () => targetAddress,
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
  });
};

const absolute = (system) => {
  const targetAddress = fetchAbsoluteAddress(system);
  return new Operand({
    read: () => system.peekFn(system.memory, targetAddress),
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
  });
};

const absoluteX = (system) => {
  const lowByte = system.peekFn(system.memory, system.registers.PC++);
  const highByte = system.peekFn(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.X;
  return new Operand({
    read: () => system.peekFn(system.memory, targetAddress),
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
  });
};

const absoluteY = (system) => {
  const lowByte = system.peekFn(system.memory, system.registers.PC++);
  const highByte = system.peekFn(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(lowByte, highByte) + system.registers.Y;
  return new Operand({
    read: () => system.peekFn(system.memory, targetAddress),
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
  });
};

const relative = immediate;

const zeroPage = (system) => {
  const address = system.peekFn(system.memory, system.registers.PC++);
  const targetAddress = buildAddress(address, 0x00);
  return new Operand({
    read: () => system.peekFn(system.memory, targetAddress),
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
  });
};

const zeroPageX = (system) => {
  const address = system.peekFn(system.memory, system.registers.PC++);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.X) & 0xFF;
  return new Operand({
    read: () => system.peekFn(system.memory, targetAddress),
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
  });
};

const zeroPageY = (system) => {
  const address = system.peekFn(system.memory, system.registers.PC++);
  const targetAddress = (buildAddress(address, 0x00) + system.registers.Y) & 0xFF;
  return new Operand({
    read: () => system.peekFn(system.memory, targetAddress),
    write: (val) => system.pokeFn(system.memory, targetAddress, val),
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