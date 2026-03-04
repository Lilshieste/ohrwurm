const { createPulseChannel } = require('./channels/pulse');

const createAPU = () => {
  const pulse1 = createPulseChannel(1);

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

  const clock = (cpuCycles) => {
    for (let i = 0; i < cpuCycles; i++) {
      pulse1.clockTimer();
    }
    // TODO: Clock frame counter for envelope/length/sweep
  };

  const getSample = () => {
    const pulseOutput = pulse1.getOutput();
    // Normalize to 0-1 range (pulse output is 0-15)
    return pulseOutput / 15;
  };

  const reset = () => {
    pulse1.setEnabled(false);
  };

  return {
    writeRegister,
    readStatus,
    clock,
    getSample,
    reset,
  };
};

module.exports = { createAPU };
