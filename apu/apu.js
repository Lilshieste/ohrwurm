// Note on timing from here: https://www.nesdev.org/wiki/APU
//  A timer is used in each of the five channels to control the sound frequency.
//  It contains a divider which is clocked by the CPU clock.
//  The triangle channel's timer is clocked on every CPU cycle,
//  but the pulse, noise, and DMC timers are clocked only on every second CPU cycle
//  and thus produce only even periods.

const { createPulseChannel } = require('./channels/pulse');

const CpuClockRate = 1789773; // NTSC CPU clock rate
const SampleRate = 44100;
const CyclesPerSample = CpuClockRate / SampleRate; // ~40.58

const createAPU = () => {
  const pulse1 = createPulseChannel(1);

  // Sample buffer for Web Audio
  const sampleBuffer = [];
  let cycleAccumulator = 0;

  // APU timer runs at half CPU rate (clocked every other CPU cycle)
  let apuCycleDivider = false;

  const registerHandlers = {
    0x4000: (value) => pulse1.writeControl(value),
    0x4001: (value) => pulse1.writeSweep(value),
    0x4002: (value) => pulse1.writeTimerLow(value),
    0x4003: (value) => pulse1.writeTimerHigh(value),
    0x4015: (value) => pulse1.setEnabled((value & 0x01) !== 0),
  };

  const writeRegister = (address, value) => {
    const handler = registerHandlers[address];
    if (handler) {
      handler(value);
    }
    // TODO: Pulse 2 ($4004-$4007), Triangle ($4008-$400B), Noise ($400C-$400F)
  };

  const readStatus = () => {
    // TODO: Return length counter status for each channel
    return 0;
  };

  const generateSample = () => {
    // Return raw NES output (0-15 range)
    // Normalization for Web Audio happens in the UI layer
    return pulse1.getOutput();
  };

  const clock = (cpuCycles) => {
    for (let i = 0; i < cpuCycles; i++) {
      // Pulse timer clocked at half CPU rate
      apuCycleDivider = !apuCycleDivider;
      if (apuCycleDivider) {
        pulse1.clockTimer();
      }

      // Accumulate cycles and generate samples at audio rate
      cycleAccumulator++;
      if (cycleAccumulator >= CyclesPerSample) {
        sampleBuffer.push(generateSample());
        cycleAccumulator -= CyclesPerSample;
      }
    }
    // TODO: Clock frame counter for envelope/length/sweep
  };

  // Get buffered samples (drains the buffer, may return fewer than requested)
  const getSamples = (count) => {
    return sampleBuffer.splice(0, Math.min(count, sampleBuffer.length));
  };

  const reset = () => {
    pulse1.setEnabled(false);
    sampleBuffer.length = 0;
    cycleAccumulator = 0;
    apuCycleDivider = false;
  };

  return {
    writeRegister,
    readStatus,
    clock,
    getSamples,
    reset,
  };
};

module.exports = { createAPU };
