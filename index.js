const { createSystem } = require('./system');
const { INSTRUCTION_SET } = require('./instructions');
const { poke, peek, buildStatusByte } = require('./memory');

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

const load = (system, start, bytes) => {
  for(let i = 0; i < bytes.length; i++) {
    poke(system, start + i, bytes[i]);
  }
};

const startingAddress = 0x0600;

const getNextInstruction = (system) => {
  const next = peek(system, system.registers.PC++);
  return next;
};
//a9 c0 aa e8 69 c4 00 

const run = (system) => {
  logHeaderWithOpCode();
  while(!system.registers.B) {
    const instruction = getNextInstruction(system);
    logStateWithOpCode(system, instruction);
    INSTRUCTION_SET[instruction](system);
  }
  logStateWithOpCode(system, 0);
};

const hex = (value) => `$${value.toString(16)}`;
const hex16 = (value) => `$${value.toString(16).padStart(4, 0)}`;
const logHeaderWithOpCode = () => console.log(`OpCode\t\tA\t\tX\t\tY\t\tPC\t\tSP\t\tNV-BDIZC`);
const logStateWithOpCode = (system, opCode) => console.log(`${hex(opCode)}\t\t${hex(system.registers.A)}\t\t${hex(system.registers.X)}\t\t${hex(system.registers.Y)}\t\t${hex16(system.registers.PC)}\t\t${hex(system.registers.SP)}\t\t${buildStatusByte(system).toString(2).padStart(8, 0)}`);

const system = createSystem();
system.registers.PC = startingAddress;
load(system, startingAddress, programBytes2);
run(system);


