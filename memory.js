const peek = ({ memory }, address) => {
  if(address < 0x0 || address > 0xFFFF) throw new Error(`Address '${address} (${address.toString(16)})' is outside the addressable range (0x0000-0xFFFF)`);

  else if(address <= 0x07FF) return memory.RAM[address];
  else if(address <= 0x0FFF) return memory.RAM[address - 0x0800];
  else if(address <= 0x17FF) return memory.RAM[address - 0x1000];
  else if(address <= 0x1FFF) return memory.RAM[address - 0x1800];

  else if(address <= 0x2007) return memory.PPU[address - 0x2000];
  else if(address <= 0x3FFF) return memory.PPU[(address % 8)];

  else if(address <= 0x4017) return memory.APU[address - 0x4000];

  else if(address <= 0x401F) return memory.APUTestMode[address - 0x4018];

  else /* if(address <= 0xFFFF) */ return memory.Cartridge[address - 0x4020];
};

const poke = ({ memory }, address, value) => {
  if(address < 0x0 || address > 0xFFFF) throw new Error(`Address '${address} (${address.toString(16)})' is outside the addressable range (0x0000-0xFFFF)`);

  else if(address <= 0x07FF) memory.RAM[address] = value;
  else if(address <= 0x0FFF) memory.RAM[address - 0x0800] = value;
  else if(address <= 0x17FF) memory.RAM[address - 0x1000] = value;
  else if(address <= 0x1FFF) memory.RAM[address - 0x1800] = value;

  else if(address <= 0x2007) memory.PPU[address - 0x2000] = value;
  else if(address <= 0x3FFF) memory.PPU[(address % 8)] = value;

  else if(address <= 0x4017) memory.APU[address - 0x4000] = value;

  else if(address <= 0x401F) memory.APUTestMode[address - 0x4018] = value;

  else /* if(address <= 0xFFFF) */ memory.Cartridge[address - 0x4020] = value;
};

const push = ({ memory, registers }, value) => {
  poke({ memory }, registers.SP, value);
  registers.SP = registers.SP === 0x0100 ? 0x01FF : --registers.SP;
};

const pull = ({ memory, registers }) => {
  registers.SP = registers.SP === 0x01FF ? 0x0100 : ++registers.SP;
  return peek({ memory }, registers.SP);
};

const buildAddress = (lowByte, highByte) => (highByte << 8) + lowByte;

const splitAddress = (address) => ({
  lowByte: address & 0xFF,
  highByte: (address >> 8) & 0xFF
});

module.exports = {
  buildAddress,
  peek,
  poke,
  pull,
  push,
  splitAddress,
};