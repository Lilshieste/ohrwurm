// New demand-driven web player
// Uses the new NsfPlayer API where audio callback drives emulation
// See: /Users/joemiller/dev/planning/ohrwurm/audio-api-design.md

const { createNsfPlayer } = require('../../nsf/nsfPlayer');

const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 2048;

const createPlayer = () => {
  let nsfPlayer = null;
  let audioContext = null;
  let scriptProcessor = null;
  let isPlaying = false;

  const loadFile = async (url) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);

    nsfPlayer = createNsfPlayer({ sampleRate: SAMPLE_RATE });
    return nsfPlayer.load(data);
  };

  const getMetadata = () => nsfPlayer?.getMetadata() ?? null;

  const selectSong = (songIndex = 0) => {
    if (!nsfPlayer) {
      throw new Error('No NSF loaded. Call loadFile first.');
    }
    nsfPlayer.selectSong(songIndex);
  };

  const startAudio = () => {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: SAMPLE_RATE,
    });

    scriptProcessor = audioContext.createScriptProcessor(BUFFER_SIZE, 0, 1);
    scriptProcessor.onaudioprocess = (event) => {
      const output = event.outputBuffer.getChannelData(0);
      if (nsfPlayer && isPlaying) {
        // Demand-driven: audio callback pulls samples, driving emulation
        const samples = nsfPlayer.read(BUFFER_SIZE);
        output.set(samples);
      } else {
        output.fill(0);
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

  const play = (songIndex) => {
    if (!nsfPlayer) {
      throw new Error('No NSF loaded. Call loadFile first.');
    }

    // If songIndex provided, select that song
    if (songIndex !== undefined) {
      selectSong(songIndex);
    }

    startAudio();
    isPlaying = true;
  };

  const stop = () => {
    isPlaying = false;
    stopAudio();
  };

  const getIsPlaying = () => isPlaying;

  const setChannelMute = (channel, muted) => {
    nsfPlayer?.setChannelMute(channel, muted);
  };

  const getChannelMutes = () => {
    return nsfPlayer?.getChannelMutes() ?? {};
  };

  const getStats = () => {
    return nsfPlayer?.getStats() ?? { bufferLevel: 0, framesExecuted: 0 };
  };

  // For debugging/advanced access
  const getNsfPlayer = () => nsfPlayer;

  return {
    loadFile,
    getMetadata,
    selectSong,
    play,
    stop,
    isPlaying: getIsPlaying,
    setChannelMute,
    getChannelMutes,
    getStats,
    getNsfPlayer,
  };
};

window.createPlayerV2 = createPlayer;
