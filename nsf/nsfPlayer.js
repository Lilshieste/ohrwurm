// An improvement on the implementation in player.js, since this one supports on-demand sample generation
//  instead of pre-buffering an entire frame's worth of samples at a time.
//  This gives a much better experience and just makes more overall sense.
//
// Also, it gets rid of the dang ol' clicks that constantly happen when the buffer runs out and has to wait
//  for the next frame to fill it up again.
const { parse } = require('./parser');
const { createAudioSource } = require('./audioSource');
const { createNES } = require('../systems/nes');
const { createInstructionSet } = require('../cpu_6502/instructions');
const { fetchDecodeExecute } = require('../cpu_6502/execution');
const { cycleCounts } = require('../cpu_6502/cycleCounts');
const { splitAddress } = require('../cpu_6502/memory');

const SENTINEL_ADDRESS = 0x0000;
const DEFAULT_SAMPLE_RATE = 44100;
const DEFAULT_FRAME_RATE = 60;

const createNsfPlayer = (options = {}) => {
  const sampleRate = options.sampleRate || DEFAULT_SAMPLE_RATE;
  const frameRate = options.frameRate || DEFAULT_FRAME_RATE;

  let nsf = null;
  let system = null;
  let instructionSet = null;
  let audioSource = null;

  // Execute a routine (init or play) until RTS returns to sentinel
  const executeRoutine = (address, { maxInstructions = 1000000 } = {}) => {
    const splitSentinelAddress = splitAddress(SENTINEL_ADDRESS);
    system.push(system.memory, system.registers, splitSentinelAddress.highByte);
    system.push(system.memory, system.registers, splitSentinelAddress.lowByte);

    system.registers.PC = address;

    let count = 0;
    let totalCycles = 0;
    while (system.registers.PC !== SENTINEL_ADDRESS) {
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

  const load = (data) => {
    nsf = parse(data);
    return getMetadata();
  };

  const selectSong = (songIndex = 0) => {
    if (!nsf) {
      throw new Error('No NSF loaded. Call load() first.');
    }

    // Create fresh system for clean state
    system = createNES();
    instructionSet = createInstructionSet();

    // Load NSF data into memory
    const { musicData, loadAddress } = nsf;
    for (let i = 0; i < musicData.length; i++) {
      system.poke(system.memory, loadAddress + i, musicData[i]);
    }

    // Run init routine
    system.registers.A = songIndex;
    system.registers.X = nsf.isPAL ? 1 : 0;
    executeRoutine(nsf.initAddress);

    // Create new audio source (internal)
    audioSource = createAudioSource({
      system,
      sampleRate,
      frameRate,
      runPlayRoutine: () => executeRoutine(nsf.playAddress),
    });
  };

  const read = (count) => {
    if (!audioSource) {
      throw new Error('No song selected. Call selectSong() first.');
    }
    return audioSource.read(count);
  };

  const getMetadata = () => {
    if (!nsf) {
      return null;
    }
    return {
      title: nsf.title,
      artist: nsf.artist,
      copyright: nsf.copyright,
      totalSongs: nsf.totalSongs,
      startingSong: nsf.startingSong,
      isPAL: nsf.isPAL,
      isNTSC: nsf.isNtsc,
    };
  };

  const setChannelMute = (channel, muted) => {
    if (system?.apu) {
      system.apu.setChannelMute(channel, muted);
    }
  };

  const getChannelMutes = () => {
    return system?.apu?.getChannelMutes() ?? {};
  };

  const getStats = () => {
    if (!audioSource) {
      return { bufferLevel: 0, framesExecuted: 0, samplesPerFrame: 0 };
    }
    return audioSource.getStats();
  };

  const getSystem = () => system;

  return {
    load,
    selectSong,
    read,
    getMetadata,
    setChannelMute,
    getChannelMutes,
    getStats,
    getSystem,
  };
};

module.exports = { createNsfPlayer };
