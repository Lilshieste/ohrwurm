const createMemory = () => ({
  APU: new Array(0x0018).fill(0),
  APUTestMode: new Array(0x0008).fill(0),
  Cartridge: new Array(0xBFE0).fill(0),
  PPU: new Array(0x0008).fill(0),
  RAM: new Array(0x0800).fill(0),
});

const createRegisters = () => ({
  A: 0,
  X: 0,
  Y: 0,

  PC: 0x0000,
  SP: 0x01FF,

  N: false,
  V: false,
  B: false,
  D: false,
  I: false,
  Z: false,
  C: false,
});

const createSystem = () => ({
  registers: createRegisters(),
  memory: createMemory(),
});

module.exports = {
  createMemory,
  createRegisters,
  createSystem,
};
