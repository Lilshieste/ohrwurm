const { fetchDecodeExecute } = require('../6502/execution');
const { cycleCounts } = require('../6502/cycleCounts');

const createNsfPlayer = (system, instructionSet, sentinelAddress) => {
  const loadMusicData = (nsf) => {
    const { musicData, loadAddress } = nsf;
    for (let i = 0; i < musicData.length; i++) {
      system.poke(system.memory, loadAddress + i, musicData[i]);
    }
  };

  const callRoutine = (address, { maxInstructions = 1000000 } = {}) => {
    // Push sentinel return address (high byte first, then low byte)
    system.push(system.memory, system.registers, (sentinelAddress >> 8) & 0xFF);
    system.push(system.memory, system.registers, sentinelAddress & 0xFF);

    system.registers.PC = address;

    // Execute until RTS returns to sentinel
    let count = 0;
    while (system.registers.PC !== sentinelAddress) {
      if (count >= maxInstructions) {
        const pc = system.registers.PC.toString(16).padStart(4, '0');
        const opcode = system.peek(system.memory, system.registers.PC).toString(16).padStart(2, '0');
        throw new Error(`Exceeded ${maxInstructions} instructions. Stuck at PC=$${pc}, opcode=$${opcode}`);
      }
      fetchDecodeExecute(system, instructionSet, { cycles: cycleCounts });
      count++;
    }
  };

  const loadNSF = (nsf, songIndex = 0) => {
    loadMusicData(nsf);

    system.registers.A = songIndex;
    system.registers.X = nsf.isPAL ? 1 : 0; // 0 = NTSC, 1 = PAL

    callRoutine(nsf.initAddress);
  };

  const play = (nsf) => {
    callRoutine(nsf.playAddress);
  };

  return {
    loadNSF,
    play,
  };
};

module.exports = { createNsfPlayer };
