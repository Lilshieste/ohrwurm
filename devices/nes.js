const { createRegisters } = require('../6502/registers');
const { pull, push } = require('../6502/memory');

// TODO: Implement memory mirroring for RAM, PPU, and Cartridge memory regions,
//  and deprecate the peek/poke functions in favor of a more robust memory bus implementation.
const createPeek = (apu) => (memory, address) => {
  if(address < 0x0 || address > 0xFFFF) throw new Error(`Address '${address} (${address.toString(16)})' is outside the addressable range (0x0000-0xFFFF)`);

  else if(address <= 0x07FF) return memory.RAM[address];
  else if(address <= 0x0FFF) return memory.RAM[address - 0x0800];
  else if(address <= 0x17FF) return memory.RAM[address - 0x1000];
  else if(address <= 0x1FFF) return memory.RAM[address - 0x1800];

  else if(address <= 0x2007) return memory.PPU[address - 0x2000];
  else if(address <= 0x3FFF) return memory.PPU[(address % 8)];

  else if(address === 0x4015 && apu) return apu.readStatus();
  else if(address <= 0x4017) return memory.APU[address - 0x4000];

  else if(address <= 0x401F) return memory.APUTestMode[address - 0x4018];

  else /* if(address <= 0xFFFF) */ return memory.Cartridge[address - 0x4020];
};

const createPoke = (apu) => (memory, address, value) => {
  if(address < 0x0 || address > 0xFFFF) throw new Error(`Address '${address} (${address.toString(16)})' is outside the addressable range (0x0000-0xFFFF)`);

  else if(address <= 0x07FF) memory.RAM[address] = value;
  else if(address <= 0x0FFF) memory.RAM[address - 0x0800] = value;
  else if(address <= 0x17FF) memory.RAM[address - 0x1000] = value;
  else if(address <= 0x1FFF) memory.RAM[address - 0x1800] = value;

  else if(address <= 0x2007) memory.PPU[address - 0x2000] = value;
  else if(address <= 0x3FFF) memory.PPU[(address % 8)] = value;

  else if(address <= 0x4017) {
    memory.APU[address - 0x4000] = value;
    if (apu) apu.writeRegister(address, value);
  }

  else if(address <= 0x401F) memory.APUTestMode[address - 0x4018] = value;

  else /* if(address <= 0xFFFF) */ memory.Cartridge[address - 0x4020] = value;
};

const createMemory = () => ({
  APU: new Array(0x0018).fill(0),
  APUTestMode: new Array(0x0008).fill(0),
  Cartridge: new Array(0xBFE0).fill(0),
  PPU: new Array(0x0008).fill(0),
  RAM: new Array(0x0800).fill(0),
});

const createNES = (apu = null) => {
  const peek = createPeek(apu);
  const poke = createPoke(apu);

  return {
    registers: createRegisters(),
    memory: createMemory(),
    apu,

    peek,
    poke,
    pull: pull(peek),
    push: push(poke),
  };
};

module.exports = {
  createNES,
};