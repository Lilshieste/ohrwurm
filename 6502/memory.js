const { isNthBitSet } = require('./util');

const VectorNMI = 0xfffa;
const VectorReset = 0xfffc;
const VectorIRQ = 0xfffe;

const peek = (memory, address) => memory[address];
const poke = (memory, address, value) => { memory[address] = value; };

const push = (poke) => (memory, registers, value) => {
  poke(memory, buildStackAddress(registers.SP), value);
  registers.SP = (registers.SP - 1) & 0xFF;
};

const pull = (peek) => (memory, registers) => {
  registers.SP = (registers.SP + 1) & 0xFF;
  return peek(memory, buildStackAddress(registers.SP));
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

const getVector = (vector) => (peek) => (memory) => {
  const lowByte = peek(memory, vector);
  const highByte = peek(memory, vector + 1);
  return buildAddress(lowByte, highByte);
};

const setVector = (vector) => (poke) => (memory, address) => {
  const {
    lowByte,
    highByte,
   } = splitAddress(address);
  poke(memory, vector, lowByte);
  poke(memory, vector + 1, highByte);
};

const getIRQVector = getVector(VectorIRQ);
const getNMIVector = getVector(VectorNMI);
const getResetVector = getVector(VectorReset);
const setIRQVector = setVector(VectorIRQ);
const setNMIVector = setVector(VectorNMI);
const setResetVector = setVector(VectorReset);

module.exports = {
  buildAddress,
  buildStackAddress,
  buildStatusByte,
  getIRQVector,
  getNMIVector,
  getResetVector,
  loadBytes,
  loadStatusByte,
  peek,
  poke,
  pull,
  push,
  read,
  setIRQVector,
  setNMIVector,
  setResetVector,
  splitAddress,
};
