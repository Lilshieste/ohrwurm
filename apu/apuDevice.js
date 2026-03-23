// APU device wrapper: $4000-$4017
// Wraps the existing APU with the device interface (read/write)
const { createAPU } = require('./apu');

const createAPUDevice = (apu = createAPU()) => {

  const read = (address) => {
    // The status register is the only readable APU register
    if (address === 0x4015) {
      return apu.readStatus();
    }

    // Other APU registers are write-only; just returning 0 for now.
    //  I'm considering whether I want to handle reads differently (e.g., return open bus values, etc.) but don't
    //  want to go down that rabbit hole yet. 😂
    //  https://www.nesdev.org/wiki/APU_registers
    return 0;
  };

  const write = (address, value) => {
    apu.writeRegister(address, value);
  };

  return {
    read,
    write,

    // Pass through APU methods for direct access
    clock: apu.clock,
    getSamples: apu.getSamples,
    reset: apu.reset,
    setChannelMute: apu.setChannelMute,
    getChannelMutes: apu.getChannelMutes,
  };
};

module.exports = { createAPUDevice };
