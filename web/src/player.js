const { parse } = require('../../nsf/parser');
const { createNsfPlayer } = require('../../nsf/player');
const { createNES } = require('../../devices/nes');
const { createInstructionSet } = require('../../6502/instructions');
const { createAPU } = require('../../apu/apu');

const SENTINEL_ADDRESS = 0x0000;

const createPlayer = () => {
  let nsf = null;
  let system = null;
  let nsfPlayer = null;
  let apu = null;

  const loadFile = async (url) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);

    nsf = parse(data);
    return nsf;
  };

  const getMetadata = () => nsf;

  const runInit = (songIndex = 0) => {
    if (!nsf) {
      throw new Error('No NSF loaded. Call loadFile first.');
    }

    apu = createAPU();
    system = createNES(apu);
    const instructionSet = createInstructionSet();
    nsfPlayer = createNsfPlayer(system, instructionSet, SENTINEL_ADDRESS);

    nsfPlayer.loadNSF(nsf, songIndex);

    return { system, nsfPlayer, apu };
  };

  const runPlay = () => {
    if (!nsfPlayer || !nsf) {
      throw new Error('No NSF initialized. Call runInit first.');
    }
    nsfPlayer.play(nsf);
  };

  const getAPU = () => apu;

  return {
    loadFile,
    getMetadata,
    runInit,
    runPlay,
    getAPU,
  };
};

window.createPlayer = createPlayer;
