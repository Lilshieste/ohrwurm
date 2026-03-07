const { createTimer } = require('../components/timer');
const { createLengthCounter } = require('../components/lengthCounter');
const { createLinearCounter } = require('../components/linearCounter');

// Triangle waveform: 32 steps, values 15→0→15
// From: https://www.nesdev.org/wiki/APU_Triangle
const TriangleWaveform = [
  15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
];

const createTriangleChannel = () => {
  const timer = createTimer();
  const lengthCounter = createLengthCounter();
  const linearCounter = createLinearCounter();

  let sequencerPosition = 0;
  let enabled = false;

  // $4008: CRRR RRRR (C = control/length halt, R = linear counter reload)
  const writeLinearCounter = (value) => {
    linearCounter.writeControl(value);
    lengthCounter.setHalt(linearCounter.getControlFlag());
  };

  // $400A: TTTT TTTT (timer low 8 bits)
  const writeTimerLow = (value) => {
    const currentPeriod = timer.getPeriod();
    const newPeriod = (currentPeriod & 0x700) | value;
    timer.setPeriod(newPeriod);
  };

  // $400B: LLLL LTTT (length counter load + timer high 3 bits)
  const writeTimerHigh = (value) => {
    const timerHigh = value & 0x07;
    const currentPeriod = timer.getPeriod();
    const newPeriod = (timerHigh << 8) | (currentPeriod & 0xFF);
    timer.setPeriod(newPeriod);

    if (enabled) {
      lengthCounter.load(value);
    }

    // Set linear counter reload flag
    linearCounter.setReloadFlag();
  };

  // Timer clocked at full CPU rate (unlike pulse/noise)
  const clockTimer = () => {
    const fired = timer.clock();
    if (fired && linearCounter.isActive() && lengthCounter.isActive()) {
      sequencerPosition = (sequencerPosition + 1) & 0x1F; // 32 steps
    }
    return fired;
  };

  const clockLinearCounter = () => {
    linearCounter.clock();
  };

  const clockLengthCounter = () => {
    lengthCounter.clock();
  };

  const getOutput = () => {
    if (!enabled) {
      return 0;
    }

    // Silenced when length counter is 0
    if (!lengthCounter.isActive()) {
      return 0;
    }

    // Silenced when linear counter is 0
    if (!linearCounter.isActive()) {
      return 0;
    }

    return TriangleWaveform[sequencerPosition];
  };

  const setEnabled = (value) => {
    enabled = value;
    if (!enabled) {
      lengthCounter.clear();
    }
  };

  return {
    writeLinearCounter,
    writeTimerLow,
    writeTimerHigh,
    clockTimer,
    clockLinearCounter,
    clockLengthCounter,
    getOutput,
    setEnabled,
  };
};

module.exports = { createTriangleChannel };
