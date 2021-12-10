const { readFromMemory, writeToMemory } = require('./memory');

const createMemory = () => ({
  APU: new Array(0x0018).fill(0),
  APUTestMode: new Array(0x0008).fill(0),
  Cartridge: new Array(0xBFE0).fill(0),
  PPU: new Array(0x0008).fill(0),
  RAM: new Array(0x0800).fill(0),
});

const createCPU = () => ({
  A: 0,
  X: 0,
  Y: 0,

  PC: 0x0000,
  SP: 0x0000,

  N: false,
  V: false,
  B: false,
  D: false,
  I: false,
  Z: false,
  C: false,
});

const createSystem = () => ({
  cpu: createCPU(),
  memory: createMemory(),
});

const peek = (system, address) => {
  return readFromMemory(system.memory)(address || system.cpu.PC);
};

const poke = (system, address, byte) => {
  writeToMemory(system.memory)(address, byte);
};

const read = (system) => {
  return readFromMemory(system.memory)(system.cpu.PC++);
};

module.exports = {
  createCPU,
  createMemory,
  createSystem,
  peek,
  poke,
  read,
};
