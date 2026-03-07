const { createLengthCounter } = require('../components/lengthCounter');

// NTSC period lookup table (indexed by lower 4 bits of $400E)
const PeriodTable = [
  4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068
];

const createNoiseChannel = () => {
  const lengthCounter = createLengthCounter();

  // Timer - initialize to PeriodTable[0] so unconfigured channel doesn't produce max-rate noise
  let timerPeriod = PeriodTable[0];
  let timerCounter = PeriodTable[0];

  // LFSR (Linear Feedback Shift Register) - 15 bits, initialized to 1
  let shiftRegister = 1;
  let mode = 0; // 0 = long sequence (32767), 1 = short sequence (93)

  // Volume/envelope
  let constantVolumeFlag = false;
  let volumeOrEnvelopePeriod = 0;
  let enabled = false; // Disabled until $4015 enables it

  // $400C: --lc vvvv (l = length counter halt, c = constant volume, v = volume/envelope)
  const writeControl = (value) => {
    lengthCounter.setHalt((value & 0x20) !== 0);
    constantVolumeFlag = (value & 0x10) !== 0;
    volumeOrEnvelopePeriod = value & 0x0F;
  };

  // $400E: M--- PPPP
  const writePeriod = (value) => {
    mode = (value >> 7) & 0x01;
    const periodIndex = value & 0x0F;
    timerPeriod = PeriodTable[periodIndex];
  };

  // $400F: LLLL L--- (L = length counter load)
  const writeLength = (value) => {
    if (enabled) {
      lengthCounter.load(value);
    }
    // TODO: Writing here also restarts envelope
  };

  const getVolume = () => {
    if (constantVolumeFlag) {
      return volumeOrEnvelopePeriod;
    }
    // TODO: return envelope output when implemented
    return 15;
  };

  const clockTimer = () => {
    if (timerCounter === 0) {
      timerCounter = timerPeriod;
      clockLFSR();
      return true;
    }
    timerCounter--;
    return false;
  };

  const clockLFSR = () => {
    // Feedback bit is XOR of bit 0 and either bit 1 (mode 0) or bit 6 (mode 1)
    const feedbackBit = mode === 0
      ? (shiftRegister & 0x01) ^ ((shiftRegister >> 1) & 0x01)
      : (shiftRegister & 0x01) ^ ((shiftRegister >> 6) & 0x01);

    // Shift right and put feedback in bit 14
    shiftRegister = (shiftRegister >> 1) | (feedbackBit << 14);
  };

  const getOutput = () => {
    if (!enabled) {
      return 0;
    }

    if (lengthCounter.isSilenced()) {
      return 0;
    }

    // Output is silenced when bit 0 of shift register is set
    if (shiftRegister & 0x01) {
      return 0;
    }

    return getVolume();
  };

  const setEnabled = (value) => {
    enabled = value;
    if (!enabled) {
      lengthCounter.clear();
    }
  };

  // Clock length counter at half-frame rate (~120Hz)
  const clockLengthCounter = () => {
    lengthCounter.clock();
  };

  return {
    writeControl,
    writePeriod,
    writeLength,
    clockTimer,
    clockLengthCounter,
    getOutput,
    setEnabled,
  };
};

module.exports = { createNoiseChannel };
