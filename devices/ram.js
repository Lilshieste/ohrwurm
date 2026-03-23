// 2KB internal RAM, mirrored across $0000-$1FFF
const createRAMDevice = () => {
  const ram = new Uint8Array(0x0800).fill(0);

  // Resolve mirrored address to physical RAM (0x0000-0x07FF)
  const resolve = (address) => address & 0x07FF;

  const read = (address) => ram[resolve(address)];

  const write = (address, value) => {
    ram[resolve(address)] = value;
  };

  return { read, write };
};

module.exports = { createRAMDevice };
