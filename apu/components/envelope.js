// NES APU Envelope Generator
// https://www.nesdev.org/wiki/APU_Envelope
//
// The envelope is a volume decay generator clocked at the quarter-frame rate (~240 Hz).
// It produces a 4-bit output (0-15) representing the current volume level.

const createEnvelope = () => {
  let divider = 0;
  let decayLevel = 0;
  let startFlag = false;
  let period = 0;
  let loopFlag = false;

  // Called when control register written
  // --LC VVVV (L = loop, C = constant volume - handled by channel, V = period)
  const writePeriod = (value) => {
    period = value & 0x0F;
  };

  const setLoopFlag = (value) => {
    loopFlag = value;
  };

  // Called when length register written
  const restart = () => {
    startFlag = true;
  };

  // Clock at quarter-frame rate (~240Hz)
  const clock = () => {
    if (startFlag) {
      startFlag = false;
      decayLevel = 15;
      divider = period;
    } else {
      if (divider > 0) {
        divider--;
      } else {
        divider = period;
        if (decayLevel > 0) {
          decayLevel--;
        } else if (loopFlag) {
          decayLevel = 15;
        }
      }
    }
  };

  const getOutput = () => decayLevel;

  return {
    writePeriod,
    setLoopFlag,
    restart,
    clock,
    getOutput,
  };
};

module.exports = { createEnvelope };
