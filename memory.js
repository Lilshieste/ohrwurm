const { isNthBitSet } = require('./util');

const peek = (memory, address) => {
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

const poke = (memory, address, value) => {
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

const push = (memory, registers, value) => {
  poke(memory, buildStackAddress(registers.SP), value);
  registers.SP = (registers.SP - 1) & 0xFF;
};

const pull = (memory, registers) => {
  registers.SP = (registers.SP + 1) & 0xFF;
  return peek(memory, buildStackAddress(registers.SP));
};

const buildAddress = (lowByte, highByte) => (highByte << 8) + lowByte;

const buildStackAddress = (lowByte) => 0x0100 + lowByte;

const splitAddress = (address) => ({
  lowByte: address & 0xFF,
  highByte: (address >> 8) & 0xFF
});

const buildStatusByte = (registers) => {
  return 0
    + (registers.C ? 0x01 : 0)
    + (registers.Z ? 0x02 : 0)
    + (registers.I ? 0x04 : 0)
    + (registers.D ? 0x08 : 0)
    + (registers.B ? 0x10 : 0)
    + 0x20 // Unused; this bit is just always set
    + (registers.V ? 0x40 : 0)
    + (registers.N ? 0x80 : 0);
};

const loadStatusByte = (registers, statusByte) => {
  registers.C = isNthBitSet(statusByte, 0);
  registers.Z = isNthBitSet(statusByte, 1);
  registers.I = isNthBitSet(statusByte, 2);
  registers.D = isNthBitSet(statusByte, 3);
  registers.B = isNthBitSet(statusByte, 4);
  registers.V = isNthBitSet(statusByte, 6);
  registers.N = isNthBitSet(statusByte, 7);
};

const loadBytes = (memory, bytes, startingAddress) => {
  for(let i = 0; i < bytes.length; i++) {
    poke(memory, startingAddress + i, bytes[i]);
  }
};

const read = ({ memory, registers }) => peek(memory, registers.PC++);

module.exports = {
  buildAddress,
  buildStackAddress,
  buildStatusByte,
  loadBytes,
  loadStatusByte,
  peek,
  poke,
  pull,
  push,
  read,
  splitAddress,
};
