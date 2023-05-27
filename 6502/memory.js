const { isNthBitSet } = require('./util');

const peek = (memory, address) => memory[address];
const poke = (memory, address, value) => { memory[address] = value; };

const push = (pokeFn) => (memory, registers, value) => {
  pokeFn(memory, buildStackAddress(registers.SP), value);
  registers.SP = (registers.SP - 1) & 0xFF;
};

const pull = (peekFn) => (memory, registers) => {
  registers.SP = (registers.SP + 1) & 0xFF;
  return peekFn(memory, buildStackAddress(registers.SP));
};

const buildAddress = (lowByte, highByte) => (highByte << 8) + lowByte;

const buildStackAddress = (lowByte) => 0x0100 + lowByte;

const splitAddress = (address) => ({
  lowByte: address & 0xFF,
  highByte: (address >> 8) & 0xFF
});

const buildStatusByte = (registers) => {
  return 0
    + (registers.C ? 0x01 : 0)
    + (registers.Z ? 0x02 : 0)
    + (registers.I ? 0x04 : 0)
    + (registers.D ? 0x08 : 0)
    + (registers.B ? 0x10 : 0)
    + 0x20 // Unused; this bit is just always set
    + (registers.V ? 0x40 : 0)
    + (registers.N ? 0x80 : 0);
};

const loadStatusByte = (registers, statusByte) => {
  registers.C = isNthBitSet(statusByte, 0);
  registers.Z = isNthBitSet(statusByte, 1);
  registers.I = isNthBitSet(statusByte, 2);
  registers.D = isNthBitSet(statusByte, 3);
  registers.B = isNthBitSet(statusByte, 4);
  registers.V = isNthBitSet(statusByte, 6);
  registers.N = isNthBitSet(statusByte, 7);
};

const loadBytes = (memory, bytes, startingAddress) => {
  for(let i = 0; i < bytes.length; i++) {
    poke(memory, startingAddress + i, bytes[i]);
  }
};

const read = (memory, registers) => peek(memory, registers.PC++);

module.exports = {
  buildAddress,
  buildStackAddress,
  buildStatusByte,
  loadBytes,
  loadStatusByte,
  peek,
  poke,
  pull,
  push,
  read,
  splitAddress,
};
