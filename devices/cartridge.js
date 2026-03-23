// Cartridge space: $4020-$FFFF
//  Just a plain ol' cartridge device. I'll handle mappers as different implementations of a
//   cartridge device when I get to them.
const createCartridgeDevice = () => {
  const memory = new Uint8Array(0xBFE0).fill(0);

  const resolve = (address) => address - 0x4020;

  const read = (address) => memory[resolve(address)];

  const write = (address, value) => {
    memory[resolve(address)] = value;
  };

  return { read, write };
};

module.exports = { createCartridgeDevice };
