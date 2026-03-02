const { parse } = require('../../nsf/parser');
const { createNsfPlayer } = require('../../nsf/player');
const { createNES } = require('../../devices/nes');
const { createInstructionSet } = require('../../6502/instructions');

const SENTINEL_ADDRESS = 0x0000;

const createPlayer = () => {
  let nsf = null;
  let system = null;
  let nsfPlayer = null;

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

    system = createNES();
    const instructionSet = createInstructionSet();
    nsfPlayer = createNsfPlayer(system, instructionSet, SENTINEL_ADDRESS);

    nsfPlayer.loadNSF(nsf, songIndex);

    return { system, nsfPlayer };
  };

  return {
    loadFile,
    getMetadata,
    runInit,
  };
};

window.createPlayer = createPlayer;
