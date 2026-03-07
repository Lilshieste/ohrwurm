// https://www.nesdev.org/wiki/APU_Triangle
const createLinearCounter = () => {
  let counter = 0;
  let reloadValue = 0;
  let reloadFlag = false;
  let controlFlag = false; // Also serves as length counter halt

  // CRRR RRRR (C = control flag, R = reload value)
  const writeControl = (value) => {
    controlFlag = (value & 0x80) !== 0;
    reloadValue = value & 0x7F;
  };

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

    if (!controlFlag) {
      reloadFlag = false;
    }
  };

  const isActive = () => counter > 0;
  const isSilenced = () => !isActive();

  // Control flag also serves as length counter halt
  const getControlFlag = () => controlFlag;

  return {
    writeControl,
    setReloadFlag,
    clock,
    isActive,
    isSilenced,
    getControlFlag,
  };
};

module.exports = { createLinearCounter };
