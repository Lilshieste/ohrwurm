const fs = require('fs');
const { INSTRUCTION_SET } = require('../instructions');
const { loadBytes, peek, runWithInstructionSet } = require('../memory');
const { createSystem } = require('../state');

describe('Test ROMs', () => {
  const startingAddress = 0x0600;
  const customRun = runWithInstructionSet(INSTRUCTION_SET);

  const loadROM = (filename, system) => {
    const contents = fs.readFileSync(filename).toString();
    const cleaned = contents
      .replace(/\/\/.*/g, '') // comments
      .replace(/\r\n$/gm, '')  // trailing newline
      .replace(/^\r\n/m, ''); // empty lines
    const bytes = cleaned.split('\r\n').map(str => parseInt(str, 16));
    loadBytes(system, bytes, startingAddress);
    system.registers.PC = startingAddress;
  };

  test.only('test00-loadstore', () => {
    const system = createSystem();

    loadROM('./tests/roms/test00-loadstore.rom', system);
    customRun(system);

    expect(peek(system, 0x022a)).toBe(0x55);
    expect(system.registers.A).toBe(0x55);
    expect(system.registers.X).toBe(0x2a);
    expect(system.registers.Y).toBe(0x73);
  });
});
