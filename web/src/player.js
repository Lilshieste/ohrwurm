const { parse } = require('../../nsf/parser');
const { createNsfPlayer } = require('../../nsf/player');
const { createNES } = require('../../devices/nes');
const { createInstructionSet } = require('../../6502/instructions');

// TODO: Refactor player to not reach directly into APU internals.
// Consider exposing needed functionality (clock, getSamples, mute controls)
// through a cleaner interface on the system or a dedicated audio controller.

const SENTINEL_ADDRESS = 0x0000;
const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 2048;

// NTSC: ~29780 CPU cycles per frame (1789773 / 60)
const CYCLES_PER_FRAME = Math.floor(1789773 / 60);

const createPlayer = () => {
  let nsf = null;
  let system = null;
  let nsfPlayer = null;
  let apu = null;
  let playInterval = null;
  let audioContext = null;
  let scriptProcessor = null;

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
    apu = system.apu;
    const instructionSet = createInstructionSet();
    nsfPlayer = createNsfPlayer(system, instructionSet, SENTINEL_ADDRESS);

    nsfPlayer.loadNSF(nsf, songIndex);

    return { system, nsfPlayer, apu };
  };

  const runPlay = () => {
    if (!nsfPlayer || !nsf) {
      throw new Error('No NSF initialized. Call runInit first.');
    }
    const cyclesUsed = nsfPlayer.play(nsf);

    // Clock APU for remaining frame time to generate enough samples
    const remainingCycles = CYCLES_PER_FRAME - cyclesUsed;
    if (remainingCycles > 0 && apu) {
      apu.clock(remainingCycles);
    }
  };

  const startAudio = () => {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: SAMPLE_RATE,
    });

    // ScriptProcessorNode is deprecated but simpler for steel thread
    scriptProcessor = audioContext.createScriptProcessor(BUFFER_SIZE, 0, 1);
    scriptProcessor.onaudioprocess = (event) => {
      const output = event.outputBuffer.getChannelData(0);
      if (apu) {
        const samples = apu.getSamples(BUFFER_SIZE);
        for (let i = 0; i < BUFFER_SIZE; i++) {
          // Normalize raw NES output (0-15) to Web Audio range (0-1)
          // Using 0-1 instead of centered -1 to 1 avoids clicks on silence transitions
          // Pad with silence (0) if APU doesn't have enough samples
          output[i] = (samples[i] ?? 0) / 15;
        }
      } else {
        for (let i = 0; i < BUFFER_SIZE; i++) {
          output[i] = 0;
        }
      }
    };

    scriptProcessor.connect(audioContext.destination);
  };

  const stopAudio = () => {
    if (scriptProcessor) {
      scriptProcessor.disconnect();
      scriptProcessor = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  };

  const startPlayLoop = () => {
    if (playInterval) return;

    startAudio();

    // 60Hz play loop - NES runs at ~60 FPS
    playInterval = setInterval(() => {
      runPlay();
    }, 1000 / 60);
  };

  const stopPlayLoop = () => {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
    stopAudio();
    if (apu) {
      apu.reset();
    }
  };

  const isPlaying = () => playInterval !== null;

  const getAPU = () => apu;

  // Channel mute controls
  const setChannelMute = (channel, muted) => {
    if (apu) {
      apu.setChannelMute(channel, muted);
    }
  };

  const getChannelMutes = () => {
    return apu ? apu.getChannelMutes() : {};
  };

  return {
    loadFile,
    getMetadata,
    runInit,
    runPlay,
    startPlayLoop,
    stopPlayLoop,
    isPlaying,
    getAPU,
    setChannelMute,
    getChannelMutes,
  };
};

window.createPlayer = createPlayer;
