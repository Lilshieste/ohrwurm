// Linear counter for triangle channel
// Clocked at quarter-frame rate (~240Hz)
// From: https://www.nesdev.org/wiki/APU_Triangle

const createLinearCounter = () => {
  let counter = 0;
  let reloadValue = 0;
  let reloadFlag = false;
  let controlFlag = false; // Also serves as length counter halt

  // $4008: CRRR RRRR (C = control flag, R = reload value)
  const writeControl = (value) => {
    controlFlag = (value & 0x80) !== 0;
    reloadValue = value & 0x7F;
  };

  // Called when $400B is written
  const setReloadFlag = () => {
    reloadFlag = true;
  };

  // Clock at quarter-frame rate (~240Hz)
  const clock = () => {
    if (reloadFlag) {
      counter = reloadValue;
    } else if (counter > 0) {
      counter--;
    }

    // Clear reload flag if control flag is clear
    if (!controlFlag) {
      reloadFlag = false;
    }
  };

  // Channel should be silenced when counter is 0
  const isActive = () => counter > 0;

  // Control flag also serves as length counter halt
  const getControlFlag = () => controlFlag;

  return {
    writeControl,
    setReloadFlag,
    clock,
    isActive,
    getControlFlag,
  };
};

module.exports = { createLinearCounter };
