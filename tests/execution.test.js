const {
  poke,
} = require('../memory');
const {
  run
} = require('../execution');
const { createSystem } = require('../state');

describe('Memory', () => {
  const system = createSystem();
  const memory = system.memory;

  const RAM_START = 1;
  const RAM_END = 2;
  const PPU_START = 3;
  const PPU_END = 4;
  const APU_START = 5;
  const APU_END = 6;
  const APU_TEST_MODE_START = 7;
  const APU_TEST_MODE_END = 8;
  const CARTRIDGE_START = 9;
  const CARTRIDGE_END = 10;
  const STACK_START =  11;
  const STACK_END = 12;

  beforeEach(() => {
    memory.RAM[0] = RAM_START;
    memory.RAM[memory.RAM.length - 1] = RAM_END;
    memory.RAM[0x01FF] = STACK_START;
    memory.RAM[0x0100] = STACK_END;

    memory.PPU[0] = PPU_START;
    memory.PPU[memory.PPU.length - 1] = PPU_END;

    memory.APU[0] = APU_START;
    memory.APU[memory.APU.length - 1] = APU_END;

    memory.APUTestMode[0] = APU_TEST_MODE_START;
    memory.APUTestMode[memory.APUTestMode.length - 1] = APU_TEST_MODE_END;

    memory.Cartridge[0] = CARTRIDGE_START;
    memory.Cartridge[memory.Cartridge.length - 1] = CARTRIDGE_END;
  });

  describe('run', () => {
    it('should read (and execute) instructions until a BRK is reached', () => {
      const system = createSystem();
      const PC = 0xface;
      const runInstruction = jest.fn((instruction, system) => { if(!instruction) system.registers.B = true; });

      system.registers.PC = PC;
      poke(system, PC, 0x42);
      poke(system, PC + 1, 0x43);

      run(system, runInstruction);

      expect(runInstruction).toHaveBeenCalledWith(0x42, expect.anything());
      expect(runInstruction).toHaveBeenCalledWith(0x43, expect.anything());
    });
  });
});