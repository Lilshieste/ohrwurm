const { createTimer } = require('../components/timer');

// Duty cycle table from NES APU documentation: https://www.nesdev.org/wiki/APU_Pulse#Sequencer_behavior
// dutyMode -> position
const DutyCycleTable = [
  [0, 1, 0, 0, 0, 0, 0, 0], // 12.5% duty
  [0, 1, 1, 0, 0, 0, 0, 0], // 25% duty
  [0, 1, 1, 1, 1, 0, 0, 0], // 50% duty
  [1, 0, 0, 1, 1, 1, 1, 1], // 75% duty (inverted 25%)
];

const createPulseChannel = (channelNumber) => {
  const timer = createTimer();



  let dutyMode = 0;
  let dutyPosition = 0;
  let constantVolume = 0;
  let enabled = true;

  // DDlc vvvv
  // DD = duty mode, l = length counter halt, c = constant volume flag, vvvv = volume
  const writeControl = (value) => {
    dutyMode = (value >> 6) & 0x03;
    constantVolume = value & 0x0F;
    // Note: length counter halt and envelope are not implemented in minimal version
  };

  // Sweep (not implemented in minimal version)
  const writeSweep = (value) => {
    // TODO: implement sweep
  };

  // Timer low 8 bits
  const writeTimerLow = (value) => {
    const currentPeriod = timer.getPeriod();
    const newPeriod = (currentPeriod & 0x700) | value;
    timer.setPeriod(newPeriod);
  };

  // LLLL LTTT - Length counter load (L), timer high 3 bits (T)
  const writeTimerHigh = (value) => {
    const timerHigh = value & 0x07;
    const currentPeriod = timer.getPeriod();
    const newPeriod = (timerHigh << 8) | (currentPeriod & 0xFF);
    timer.setPeriod(newPeriod);

    // Writing to this register resets duty position
    dutyPosition = 0;

    // Note: length counter load not implemented in minimal version
  };

  const clockTimer = () => {
    const fired = timer.clock();
    if (fired) {
      dutyPosition = (dutyPosition + 1) & 0x07;
    }
    return fired;
  };

  const getOutput = () => {
    if (!enabled) {
      return 0;
    }

    const dutyValue = DutyCycleTable[dutyMode][dutyPosition];
    if (dutyValue === 0) {
      return 0;
    }

    return constantVolume;
  };

  const setEnabled = (value) => {
    enabled = value;
  };

  const getTimerPeriod = () => timer.getPeriod();

  return {
    writeControl,
    writeSweep,
    writeTimerLow,
    writeTimerHigh,
    clockTimer,
    getOutput,
    setEnabled,
    getTimerPeriod,
  };
};

module.exports = { createPulseChannel };
