const fs = require('fs');
const { INSTRUCTION_SET } = require('../instructions');
const { loadBytes, peek } = require('../memory');
const { runWithInstructionSet } = require('../execution');
const { createSystem } = require('../state');
//const { runWithInstructionSetAndSummary } = require('../debug');

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

  const testROM = (filename) => {
    const system = createSystem();
    loadROM(filename, system);
    customRun(system);

    return system;
  };

  test('test00-loadstore', () => {
    const system = testROM('./tests/roms/test00-loadstore.rom');

    expect(peek(system.memory, 0x022a)).toBe(0x55);
    expect(system.registers.A).toBe(0x55);
    expect(system.registers.X).toBe(0x2a);
    expect(system.registers.Y).toBe(0x73);
  });

  test('test01-andorxor', () => {
    const system = testROM('./tests/roms/test01-andorxor.rom');

    expect(peek(system.memory, 0xa9)).toBe(0xaa);
  });

  test('test02-incdec.rom', () => {
    const system = testROM('./tests/roms/test02-incdec.rom');

    expect(peek(system.memory, 0x71)).toBe(0xff);
  });

  test.skip('test03-bitshifts.rom', () => {
    const system = testROM('./tests/roms/test03-bitshifts.rom');

    expect(peek(system.memory, 0x01dd)).toBe(0x6e);
  });

  test.skip('test04-jumpsret', () => {
    const system = testROM('tests/roms/test04-jumpsret.rom');

    expect(peek(system.memory, 0x40)).toBe(0x42);
  });

  test('test05-reginstrs', () => {
    const system = testROM('tests/roms/test05-reginstrs.rom');

    expect(peek(system.memory, 0x40)).toBe(0x33);
  });

  test.skip('test06-addsub', () => {
    const system = testROM('tests/roms/test06-addsub.rom');

    expect(peek(system.memory, 0x30)).toBe(0x9d);
  });

  test('test07-cmpbeqbne', () => {
    const system = testROM('tests/roms/test07-cmpbeqbne.rom');

    expect(peek(system.memory, 0x15)).toBe(0x7f);
  });

  test('test08-cpxybit', () => {
    const system = testROM('tests/roms/test08-cpxybit.rom');

    expect(peek(system.memory, 0x42)).toBe(0xa5);
  });

  test.skip('test09-otherbranches', () => {
    const system = testROM('tests/roms/test09-otherbranches.rom');

    expect(peek(system.memory, 0x80)).toBe(0x1f);
  });

  test('test10-flaginstrs', () => {
    const system = testROM('tests/roms/test10-flaginstrs.rom');

    expect(peek(system.memory, 0x30)).toBe(0xce);
  });

  test('test11-stackinstrs', () => {
    const system = testROM('tests/roms/test11-stackinstrs.rom');

    expect(peek(system.memory, 0x30)).toBe(0x29);
  });

  test.skip('test12-rti', () => {
    const system = testROM('tests/roms/test12-rti.rom');

    expect(peek(system.memory, 0x33)).toBe(0x42);
  });

  test.skip('test13-specialflags', () => {
    const system = testROM('tests/roms/test13-specialflags.rom');

    expect(peek(system.memory, 0x21)).toBe(0x0c);
  });

  test.skip('test14-brk', () => {
    const system = testROM('tests/roms/test14-brk.rom');

    expect(peek(system.memory, 0x60)).toBe(0x42);
  });
});
