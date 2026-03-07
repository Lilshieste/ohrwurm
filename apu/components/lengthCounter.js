// https://www.nesdev.org/wiki/APU_Length_Counter
const LENGTH_TABLE = [
  10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14,
  12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30
];

const createLengthCounter = () => {
  let counter = 0;
  let halt = false;

  // Load counter from lookup table (called when $4003/$4007/$400F/$400B written)
  const load = (value) => {
    const index = (value >> 3) & 0x1F; // Upper 5 bits
    counter = LENGTH_TABLE[index];
  };

  // Set halt flag (from control register bit 5)
  const setHalt = (value) => {
    halt = value;
  };

  // Clock at half-frame rate (~120Hz)
  // Returns true if counter is still active (non-zero)
  const clock = () => {
    if (!halt && counter > 0) {
      counter--;
    }
  };

  const isActive = () => counter > 0;
  const isSilenced = () => !isActive();

  const getCounter = () => counter;

  // Clear counter (e.g., when channel has been disabled)
  const clear = () => {
    counter = 0;
  };

  return {
    load,
    setHalt,
    clock,
    isActive,
    isSilenced,
    getCounter,
    clear,
  };
};

module.exports = { createLengthCounter };
