// Note on timing from here: https://www.nesdev.org/wiki/APU
//  A timer is used in each of the five channels to control the sound frequency.
//  It contains a divider which is clocked by the CPU clock.
//  The triangle channel's timer is clocked on every CPU cycle,
//  but the pulse, noise, and DMC timers are clocked only on every second CPU cycle
//  and thus produce only even periods.

const { createPulseChannel } = require('./channels/pulse');
const { createNoiseChannel } = require('./channels/noise');
const { createTriangleChannel } = require('./channels/triangle');
const { createWatcher } = require('./watcher');
const { mixScaled } = require('./mixer');

const CpuClockRate = 1789773; // NTSC CPU clock rate
const SampleRate = 44100;
const CyclesPerSample = CpuClockRate / SampleRate; // ~40.58
const CyclesPerQuarterFrame = 7457; // CpuClockRate / 240Hz (envelope, linear counter)
const CyclesPerHalfFrame = 14914; // CpuClockRate / 120Hz (length counter, sweep)

const createAPU = () => {
  const pulse1 = createPulseChannel(1);
  const pulse2 = createPulseChannel(2);
  const triangle = createTriangleChannel();
  const noise = createNoiseChannel();

  // Sample buffer for Web Audio
  const sampleBuffer = [];

  // Channel mute state (independent of NSF's $4015 enable/disable)
  const channelMutes = {
    pulse1: false,
    pulse2: false,
    triangle: false,
    noise: false,
    dmc: false,
  };

  // Helper for sample generation (needed before watchers are defined)
  const generateSample = () => {
    return mixScaled(
      channelMutes.pulse1 ? 0 : pulse1.getOutput(),
      channelMutes.pulse2 ? 0 : pulse2.getOutput(),
      channelMutes.triangle ? 0 : triangle.getOutput(),
      channelMutes.noise ? 0 : noise.getOutput()
      // TODO: channelMutes.dmc ? 0 : dmc.getOutput()
    );
  };

  // Watchers: clock dividers that fire actions at specific rates
  const watchers = [
    // Triangle timer: clocked at full CPU rate
    createWatcher(1, () => {
      triangle.clockTimer();
    }),
    // APU timers: pulse/noise clocked at half CPU rate
    createWatcher(2, () => {
      pulse1.clockTimer();
      pulse2.clockTimer();
      noise.clockTimer();
    }),
    // Frame counter: quarter-frame events at ~240Hz (envelope, linear counter)
    createWatcher(CyclesPerQuarterFrame, () => {
      triangle.clockLinearCounter();
      pulse1.clockEnvelope();
      pulse2.clockEnvelope();
      noise.clockEnvelope();
    }),
    // Frame counter: half-frame events at ~120Hz (length counter, sweep)
    createWatcher(CyclesPerHalfFrame, () => {
      triangle.clockLengthCounter();
      noise.clockLengthCounter();
      // TODO: pulse1.clockLengthCounter(), pulse1.clockSweep()
    }),
    // Sample generation at audio rate
    createWatcher(CyclesPerSample, () => {
      sampleBuffer.push(generateSample());
    }),
  ];

  const registerHandlers = {
    // Pulse 1: $4000-$4003
    0x4000: (value) => pulse1.writeControl(value),
    0x4001: (value) => pulse1.writeSweep(value),
    0x4002: (value) => pulse1.writeTimerLow(value),
    0x4003: (value) => pulse1.writeTimerHigh(value),
    // Pulse 2: $4004-$4007
    0x4004: (value) => pulse2.writeControl(value),
    0x4005: (value) => pulse2.writeSweep(value),
    0x4006: (value) => pulse2.writeTimerLow(value),
    0x4007: (value) => pulse2.writeTimerHigh(value),
    // Triangle: $4008-$400B
    0x4008: (value) => triangle.writeLinearCounter(value),
    0x400A: (value) => triangle.writeTimerLow(value),
    0x400B: (value) => triangle.writeTimerHigh(value),
    // Noise: $400C-$400F
    0x400C: (value) => noise.writeControl(value),
    0x400E: (value) => noise.writePeriod(value),
    0x400F: (value) => noise.writeLength(value),
    // Status: $4015
    0x4015: (value) => {
      pulse1.setEnabled((value & 0x01) !== 0);
      pulse2.setEnabled((value & 0x02) !== 0);
      triangle.setEnabled((value & 0x04) !== 0);
      noise.setEnabled((value & 0x08) !== 0);
    },
  };

  const writeRegister = (address, value) => {
    const handler = registerHandlers[address];
    if (handler) {
      handler(value);
    }
  };

  const readStatus = () => {
    // TODO: Return length counter status for each channel
    return 0;
  };

  const clock = (cpuCycles) => {
    for (let i = 0; i < cpuCycles; i++) {
      for (const watcher of watchers) {
        watcher.clock();
      }
    }
  };

  // Get buffered samples (drains the buffer, may return fewer than requested)
  const getSamples = (count) => {
    return sampleBuffer.splice(0, Math.min(count, sampleBuffer.length));
  };

  const reset = () => {
    pulse1.setEnabled(false);
    pulse2.setEnabled(false);
    triangle.setEnabled(false);
    noise.setEnabled(false);
    sampleBuffer.length = 0;
    watchers.forEach(w => w.reset());
  };

  // Channel mute controls (for UI - independent of NSF's $4015)
  const setChannelMute = (channel, muted) => {
    if (channel in channelMutes) {
      channelMutes[channel] = muted;
    }
  };

  const getChannelMutes = () => ({ ...channelMutes });

  return {
    writeRegister,
    readStatus,
    clock,
    getSamples,
    reset,
    setChannelMute,
    getChannelMutes,
  };
};

module.exports = { createAPU };
