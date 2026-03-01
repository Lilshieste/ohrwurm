const { fetchDecodeExecute } = require('../6502/execution');
const { cycleCounts } = require('../6502/cycleCounts');

const createNsfPlayer = (system, instructionSet, sentinelAddress) => {
  const loadMusicData = (nsf) => {
    const { musicData, loadAddress } = nsf;
    for (let i = 0; i < musicData.length; i++) {
      system.poke(system.memory, loadAddress + i, musicData[i]);
    }
  };

  const callRoutine = (address) => {
    // Push sentinel return address (high byte first, then low byte)
    system.push(system.memory, system.registers, (sentinelAddress >> 8) & 0xFF);
    system.push(system.memory, system.registers, sentinelAddress & 0xFF);

    system.registers.PC = address;

    // Execute until RTS returns to sentinel
    while (system.registers.PC !== sentinelAddress) {
      fetchDecodeExecute(system, instructionSet, { cycles: cycleCounts });
    }
  };

  const loadNSF = (nsf, songNumber) => {
    loadMusicData(nsf);

    system.registers.A = songNumber - 1;
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
