const { createRegisters } = require('../6502/registers');
const { peek, poke, pull, push } = require('../6502/memory');

const createMemory = () => new Array(0xFFFF).fill(0);

const createBasicDevice = () => {
  return {
    registers: createRegisters(),
    memory: createMemory(),

    peekFn: peek,
    pokeFn: poke,
    pull: pull(peek),
    push: push(poke),
  };
};

module.exports = {
  createBasicDevice,
};
