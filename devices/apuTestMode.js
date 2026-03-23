// APU test mode registers: $4018-$401F
const createAPUTestModeDevice = () => {
  const registers = new Uint8Array(8).fill(0);

  const resolve = (address) => address - 0x4018;

  const read = (address) => registers[resolve(address)];

  const write = (address, value) => {
    registers[resolve(address)] = value;
  };

  return { read, write };
};

module.exports = { createAPUTestModeDevice };
