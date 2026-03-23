const { fetchDecodeExecute } = require('../../cpu_6502/execution');
const { cycleCounts } = require('../../cpu_6502/cycleCounts');
const { createBasicDevice } = require('../../systems/basic');
const { createInstructionSet } = require('../../cpu_6502/instructions');

describe('fetchDecodeExecute', () => {
  const system = createBasicDevice();
  const instructionSet = createInstructionSet();

  describe('When executing an instruction', () => {
    it('returns the cycle count for the executed instruction', () => {
      const testInstruction = 0xEA; // NOP

      system.poke(system.memory, 0x8000, testInstruction);
      system.registers.PC = 0x8000;

      const expectedCycleCount = cycleCounts[testInstruction];
      const result = fetchDecodeExecute(system, instructionSet, { cycles: cycleCounts });

      expect(result.cycles).toBe(expectedCycleCount);
    });

    it('returns correct cycle count for multi-byte instructions', () => {
      const testInstruction = 0xA9; // LDA immediate
      const operand = 0x42;
      system.poke(system.memory, 0x8000, testInstruction);
      system.poke(system.memory, 0x8001, operand);
      system.registers.PC = 0x8000;

      const expectedCycleCount = cycleCounts[testInstruction];
      const result = fetchDecodeExecute(system, instructionSet, { cycles: cycleCounts });

      expect(result.cycles).toBe(expectedCycleCount);
    });

    it('returns correct cycle count for JSR', () => {
      const testInstruction = 0x20; // JSR

      system.poke(system.memory, 0x8000, 0x20);
      system.poke(system.memory, 0x8001, 0x00);
      system.poke(system.memory, 0x8002, 0x90);
      system.registers.PC = 0x8000;

      const expectedCycleCount = cycleCounts[testInstruction];
      const result = fetchDecodeExecute(system, instructionSet, { cycles: cycleCounts });

      expect(result.cycles).toBe(expectedCycleCount);
    });

    it('returns isBrk true for BRK instruction', () => {
      const BRKInstruction = 0x00;

      system.poke(system.memory, 0x8000, BRKInstruction);
      system.registers.PC = 0x8000;

      const result = fetchDecodeExecute(system, instructionSet, { cycles: cycleCounts });

      expect(result.isBrk).toBe(true);
    });

    it('returns isBrk false for non-BRK instructions', () => {
      const testInstruction = 0xEA; // NOP
      expect(testInstruction).not.toBe(0x00); // Ensure it's not BRK... that could get confusing 😂

      system.poke(system.memory, 0x8000, testInstruction);
      system.registers.PC = 0x8000;

      const result = fetchDecodeExecute(system, instructionSet, { cycles: cycleCounts });

      expect(result.isBrk).toBe(false);
    });
  });
});
