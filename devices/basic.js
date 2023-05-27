const { createRegisters } = require('../6502/registers');
const { peek, poke } = require('../6502/memory');

const createMemory = () => new Array(0xFFFF).fill(0);

const createBasicDevice = () => {
  return {
    registers: createRegisters(),
    memory: createMemory(),

    peekFn: peek,
    pokeFn: poke,
  };
};

module.exports = {
  createBasicDevice,
};
