const { createSystem } = require('./state');
const { INSTRUCTION_SET } = require('./instructions');
const { buildStatusByte, loadBytes, read } = require('./memory');

// read program from file
// load program into memory
// set PC
// run

const programBytes = [
  0xa9, 0x01,
  0x8d, 0x00, 0x02,
  0xa9, 0x05,
  0x8d, 0x01, 0x02,
  0xa9, 0x08,
  0x8d, 0x02, 0x02,
];

const programBytes2 = [
  0xa9, 0xc0, 0xaa, 0xe8, 0x69, 0xc4, 00 
];

const programBytes3 = [
  0xA9, 0x40, 0x85, 0x00, 0xA6, 0x00, 0xE8, 0xCA,
  0x86, 0x01, 0xA4, 0x01, 0xC8, 0x88, 0x84, 0x02,
  0x84, 0x03, 0x84, 0x04, 0xE6, 0x03, 0xC6, 0x04,
];

const startingAddress = 0x0600;

const run = (system) => {
  logHeaderWithOpCode();
  while(!system.registers.B) {
    const instruction = read(system);
    INSTRUCTION_SET[instruction](system);
  }
  logStateWithOpCode(system, 0);
  logRAM(system);
};

const hex = (value) => `$${value.toString(16)}`;
const hex16 = (value) => `$${value.toString(16).padStart(4, 0)}`;
const logHeaderWithOpCode = () => console.log(`OpCode\t\tA\t\tX\t\tY\t\tPC\t\tSP\t\tNV-BDIZC`);
const logStateWithOpCode = (system, opCode) => console.log(`${hex(opCode)}\t\t${hex(system.registers.A)}\t\t${hex(system.registers.X)}\t\t${hex(system.registers.Y)}\t\t${hex16(system.registers.PC)}\t\t${hex(system.registers.SP)}\t\t${buildStatusByte(system).toString(2).padStart(8, 0)}`);
const logRAM = (system) => console.log(`${JSON.stringify(system.memory.RAM.map(hex))}`);

const system = createSystem();
system.registers.PC = startingAddress;
loadBytes(system, programBytes3, startingAddress);
run(system);


