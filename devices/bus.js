// I'm not sure how I want to model this yet; so I'm just using this to represent the system bus for now,
//  routing reads/writes to the NES-defined mappings based on the address.
const createBus = ({ ram, ppu, apu, apuTestMode, cartridge }) => {
  const read = (address) => {
    if (address < 0x0000 || address > 0xFFFF) {
      throw new Error(`Address '${address} (${address.toString(16)})' is outside the addressable range (0x0000-0xFFFF)`);
    }

    if (address <= 0x1FFF) return ram.read(address);
    if (address <= 0x3FFF) return ppu.read(address);
    if (address <= 0x4017) return apu.read(address);
    if (address <= 0x401F) return apuTestMode.read(address);
    return cartridge.read(address);
  };

  const write = (address, value) => {
    if (address < 0x0000 || address > 0xFFFF) {
      throw new Error(`Address '${address} (${address.toString(16)})' is outside the addressable range (0x0000-0xFFFF)`);
    }

    if (address <= 0x1FFF) ram.write(address, value);
    else if (address <= 0x3FFF) ppu.write(address, value);
    else if (address <= 0x4017) apu.write(address, value);
    else if (address <= 0x401F) apuTestMode.write(address, value);
    else cartridge.write(address, value);
  };

  return { read, write };
};

module.exports = { createBus };
