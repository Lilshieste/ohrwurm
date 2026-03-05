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
  let constantVolumeFlag = false;
  let volumeOrEnvelopePeriod = 0;
  let enabled = true;

  // DDlc vvvv
  // DD = duty mode, l = length counter halt, c = constant volume flag, vvvv = volume/envelope period
  const writeControl = (value) => {
    dutyMode = (value >> 6) & 0x03;
    constantVolumeFlag = (value & 0x10) !== 0;
    volumeOrEnvelopePeriod = value & 0x0F;
    // Note: length counter halt and envelope are not implemented in minimal version
  };

  // Get effective volume (uses envelope when implemented, for now defaults to 15 if not constant)
  const getVolume = () => {
    if (constantVolumeFlag) {
      return volumeOrEnvelopePeriod;
    }
    // TODO: return envelope output when implemented
    // For now, default to full volume since we don't have envelope
    return 15;
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

    // Silence channel if period < 8 (would be ultrasonic, causes aliasing)
    // The frequency formula is: Freq = 1,789,773 / (32 × (period + 1))
    //    - Period 7: 1,789,773 / (32 × 8) = ~6,991 Hz (audible)
    //    - Period 0: 1,789,773 / (32 × 1) = ~55,930 Hz (ultrasonic!)
    // Per the Nyquist theorem, since our sample rate is 44,100 Hz we can only accurately
    //  represent frequencies up to ~22,050 Hz. So going above that could cause aliasing (and clicks).
    //  The NES APU silences the channel when period < 8, so we do the same here.
    if (timer.getPeriod() < 8) {
      return 0;
    }

    const dutyValue = DutyCycleTable[dutyMode][dutyPosition];
    if (dutyValue === 0) {
      return 0;
    }

    return getVolume();
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
