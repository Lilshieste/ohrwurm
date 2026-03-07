// Length counter lookup table (indexed by upper 5 bits of $4003/$4007/$400F/$400B)
// From: https://www.nesdev.org/wiki/APU_Length_Counter
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

  // Channel should be silenced when counter is 0
  const isActive = () => counter > 0;

  // For $4015 status reads
  const getCounter = () => counter;

  // Clear counter (when channel disabled via $4015)
  const clear = () => {
    counter = 0;
  };

  return {
    load,
    setHalt,
    clock,
    isActive,
    getCounter,
    clear,
  };
};

module.exports = { createLengthCounter };
