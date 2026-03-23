// Handles demand-driven sample generation with frame timing
const createAudioSource = ({ system, sampleRate, frameRate, runPlayRoutine }) => {
  const samplesPerFrame = Math.ceil(sampleRate / frameRate);
  const cyclesPerFrame = Math.floor(1789773 / frameRate);

  let samplesUntilNextFrame = 0;
  let framesExecuted = 0;

  const runFrame = () => {
    const cyclesUsed = runPlayRoutine();
    const remaining = cyclesPerFrame - cyclesUsed;
    if (remaining > 0) {
      system.apu.clock(remaining);
    }
    framesExecuted++;
  };

  const read = (count) => {
    const output = new Float32Array(count);
    let outputIndex = 0;

    while (outputIndex < count) {
      // Run a frame if we need more samples
      const available = system.apu.getSampleCount();
      if (available === 0) {
        runFrame();
        samplesUntilNextFrame = samplesPerFrame;
        continue;
      }

      // Drain available samples from APU buffer
      const toTake = Math.min(available, count - outputIndex);
      const raw = system.apu.getSamples(toTake);

      // Normalize (0-15 → 0.0-1.0) and copy to output
      for (let i = 0; i < raw.length; i++) {
        output[outputIndex++] = raw[i] / 15;
      }
      samplesUntilNextFrame -= raw.length;
    }

    return output;
  };

  const getStats = () => ({
    bufferLevel: system.apu.getSampleCount(),
    framesExecuted,
    samplesPerFrame,
  });

  return { read, getStats };
};

module.exports = { createAudioSource };
