// 8 PPU registers, mirrored across $2000-$3FFF
// I'm not doing anything with this right now, as I'm just focused on audio emulation... but I
//  want to leave some space for it in the design in case the spirit moves me.
const createPPUDevice = () => {
  const registers = new Uint8Array(8).fill(0);

  // Resolve mirrored address to register index (0-7)
  const resolve = (address) => (address - 0x2000) & 0x07;

  const read = (address) => registers[resolve(address)];

  const write = (address, value) => {
    registers[resolve(address)] = value;
  };

  return { read, write };
};

module.exports = { createPPUDevice };
