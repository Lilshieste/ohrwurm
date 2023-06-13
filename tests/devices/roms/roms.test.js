const fs = require('fs');
const { createInstructionSet } = require('../../../6502/instructions');
const { buildStatusByte, loadBytes, peek, setIRQVector } = require('../../../6502/memory');
const { start } = require('../../../6502/execution');
const { createBasicDevice } = require('../../../devices/basic');
const { defaultCreateContext } = require('../../../6502/addressingModes');

describe('Test ROMs', () => {
  //const startingAddress = 0x0600;
  //const startingAddress = 600;
  const startingAddress = 0xf000;
  //const startingAddress = 0;

  const loadROM = (filename, system) => {
    const fullPath = `./tests/devices/roms/${filename}`;
    const contents = fs.readFileSync(fullPath).toString();
    const cleaned = contents
      .replace(/\/\/.*/g, '') // comments
      .replace(/#.*/g, '') // #comments
      .replace(/\r\n$/gm, '')  // trailing newline
      .replace(/^\r\n/m, ''); // empty lines
    const bytes = cleaned.split('\r\n').map(str => parseInt(str, 16));
    loadBytes(system.memory, bytes, startingAddress);
    system.registers.PC = startingAddress;
  };

  const testROM = (filename, maxBreakCount = 0, verbose = false) => {
    let currentOperand;
    let pokes = [];
    let current = {};
    const history = [];
    const preExecute = () => {
      current = { ...system.registers }
      currentOperand = null;
    };
    const postExecute = (decoded) => {
      current.opCode = decoded.opCode;
      current.operand = currentOperand;
      current.pokes = pokes; 
      history.push(current);
      pokes = [];
    };
    const system = createBasicDevice();
    setIRQVector(system.poke)(system.memory, 0xf005);

    const originalPoke = system.poke;
    system.poke = (memory, address, value) =>
    {
      pokes.push({ address, value });
      return originalPoke(memory, address, value);
    };
    system.options = {
      onOperandRead: (operand) => { currentOperand = operand; },
    };


    const instructionSet = createInstructionSet();
    loadROM(filename, system);

    try {
      start(system, instructionSet, { preExecute, postExecute }, maxBreakCount);
    } catch(e) {
      console.log(`~~~Error: ${e}`);
    }

    if(verbose) {
      const hex = (value) => `$${value?.toString(16)}`;
      const hex16 = (value) => `$${value.toString(16).padStart(4, 0)}`;
      const headerWithOpCode = `Op\t\tOperand\t\tA\t\tX\t\tY\t\tPC\t\tSP\t\tNV-BDIZC`;
      const pokesOutput = (e) => e.pokes.map(p => `\tPoke ${hex(p.address)} = ${hex(p.value)}`).join('\n');
      const stateWithOpCode = (e) => `${hex(e.opCode)}\t\t${hex(e.operand||'')}\t\t${hex(e.A)}\t\t${hex(e.X)}\t\t${hex(e.Y)}\t\t${hex16(e.PC)}\t\t${hex(e.SP)}\t\t${buildStatusByte(e).toString(2).padStart(8, 0)}\n${pokesOutput(e)}`;
      console.log(headerWithOpCode + '\n' + history.map(stateWithOpCode).join('\n'));
    }

    return system;
  };

  test('test00-loadstore', () => {
    const system = testROM('test00-loadstore.rom');

    expect(peek(system.memory, 0x022a)).toBe(0x55);
    expect(system.registers.A).toBe(0x55);
    expect(system.registers.X).toBe(0x2a);
    expect(system.registers.Y).toBe(0x73);
  });

  test('test01-andorxor', () => {
    const system = testROM('test01-andorxor.rom');

    expect(peek(system.memory, 0xa9)).toBe(0xaa);
  });

  test('test02-incdec.rom', () => {
    const system = testROM('test02-incdec.rom');

    expect(peek(system.memory, 0x71)).toBe(0xff);
  });

  test('test03-bitshifts.rom', () => {
    const system = testROM('test03-bitshifts.rom');

    expect(peek(system.memory, 0x01dd)).toBe(0x6e);
  });

  test('test04-jumpsret', () => {
    const system = testROM('test04-jumpsret.rom');

    expect(peek(system.memory, 0x40)).toBe(0x42);
  });

  test('test05-reginstrs', () => {
    const system = testROM('test05-reginstrs.rom');

    expect(peek(system.memory, 0x40)).toBe(0x33);
  });

  test('test06-addsub', () => {
    const system = testROM('test06-addsub.rom');

    expect(peek(system.memory, 0x30)).toBe(0x9d);
  });

  test('test07-cmpbeqbne', () => {
    const system = testROM('test07-cmpbeqbne.rom');

    expect(peek(system.memory, 0x15)).toBe(0x7f);
  });

  test('test08-cpxybit', () => {
    const system = testROM('test08-cpxybit.rom');

    expect(peek(system.memory, 0x42)).toBe(0xa5);
  });

  test('test09-otherbranches', () => {
    const system = testROM('test09-otherbranches.rom');

    expect(peek(system.memory, 0x80)).toBe(0x1f);
  });

  test('test10-flaginstrs', () => {
    const system = testROM('test10-flaginstrs.rom');

    expect(peek(system.memory, 0x30)).toBe(0xce);
  });

  test('test11-stackinstrs', () => {
    const system = testROM('test11-stackinstrs.rom');

    expect(peek(system.memory, 0x30)).toBe(0x29);
  });

  test('test12-rti', () => {
    const system = testROM('test12-rti.rom');

    expect(peek(system.memory, 0x33)).toBe(0x42);
  });

  test('test13-specialflags', () => {
    const system = testROM('test13-specialflags.rom');

    expect(peek(system.memory, 0x21)).toBe(0x0c);
  });

  test('test14-brk', () => {
    const system = testROM('test14-brk.rom', 1);

    expect(peek(system.memory, 0x60)).toBe(0x42);
  });
});
