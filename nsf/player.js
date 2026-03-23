const { fetchDecodeExecute } = require('../cpu_6502/execution');
const { cycleCounts } = require('../cpu_6502/cycleCounts');
const { splitAddress } = require('../cpu_6502/memory');

const createNsfPlayer = (system, instructionSet, sentinelAddress) => {
  const loadMusicData = (nsf) => {
    const { musicData, loadAddress } = nsf;
    for (let i = 0; i < musicData.length; i++) {
      system.poke(system.memory, loadAddress + i, musicData[i]);
    }
  };

  const callRoutine = (address, { maxInstructions = 1000000 } = {}) => {
    const splitSentinelAddress = splitAddress(sentinelAddress);
    system.push(system.memory, system.registers, splitSentinelAddress.highByte);
    system.push(system.memory, system.registers, splitSentinelAddress.lowByte);

    system.registers.PC = address;

    // Execute until RTS returns to sentinel
    let count = 0;
    let totalCycles = 0;
    while (system.registers.PC !== sentinelAddress) {
      if (count >= maxInstructions) {
        const pc = system.registers.PC.toString(16).padStart(4, '0');
        const opcode = system.peek(system.memory, system.registers.PC).toString(16).padStart(2, '0');
        throw new Error(`Exceeded ${maxInstructions} instructions. Stuck at PC=$${pc}, opcode=$${opcode}`);
      }
      const { cycles } = fetchDecodeExecute(system, instructionSet, { cycles: cycleCounts });

      // Clock APU by the number of CPU cycles consumed
      if (system.apu) {
        system.apu.clock(cycles);
      }

      totalCycles += cycles;
      count++;
    }

    return totalCycles;
  };

  const loadNSF = (nsf, songIndex = 0) => {
    loadMusicData(nsf);

    system.registers.A = songIndex;
    system.registers.X = nsf.isPAL ? 1 : 0; // 0 = NTSC, 1 = PAL

    callRoutine(nsf.initAddress);
  };

  const play = (nsf) => {
    return callRoutine(nsf.playAddress);
  };

  return {
    loadNSF,
    play,
  };
};

module.exports = { createNsfPlayer };
