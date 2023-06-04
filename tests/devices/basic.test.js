const {
  start
} = require('../../6502/execution');
const { createBasicDevice } = require('../../devices/basic');
const { createInstructionSet } = require('../../6502/instructions');
const { buildStackAddress } = require('../../6502/memory');

describe('A basic 6502 device with a pool of RAM', () => {
  const system = createBasicDevice();
  const instructionSet = createInstructionSet();
  const peek = system.peekFn;
  const poke = system.pokeFn;

  describe('start', () => {
    it('should read (and execute) instructions until a BRK is reached', () => {
      const PC = 0xfaca;

      system.registers.PC = PC;
      poke(system.memory, PC, 0xea);
      poke(system.memory, PC + 1, 0xea);

      start(system, instructionSet);

      expect(peek(system.memory, buildStackAddress(system.registers.SP + 2))).toBe(0xcd);
      expect(peek(system.memory, buildStackAddress(system.registers.SP + 3))).toBe(0xfa);
    });
  });
});