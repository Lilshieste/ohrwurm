// const { createBasicDevice } = require('./devices/basic');
// const { INSTRUCTION_SET } = require('./6502/instructions');
// const { loadBytes } = require('./6502/memory');
// const { runWithInstructionSetAndSummary } = require('./6502/debug');


// // read program from file
// // load program into memory
// // set PC
// // run

// const programBytes = [
//   0xa9, 0x01,
//   0x8d, 0x00, 0x02,
//   0xa9, 0x05,
//   0x8d, 0x01, 0x02,
//   0xa9, 0x08,
//   0x8d, 0x02, 0x02,
// ];

// const programBytes2 = [
//   0xa9, 0xc0, 0xaa, 0xe8, 0x69, 0xc4, 00 
// ];

// const programBytes3 = [
//   0xA9, 0x40, 0x85, 0x00, 0xA6, 0x00, 0xE8, 0xCA,
//   0x86, 0x01, 0xA4, 0x01, 0xC8, 0x88, 0x84, 0x02,
//   0x84, 0x03, 0x84, 0x04, 0xE6, 0x03, 0xC6, 0x04,
// ];

// const startingAddress = 0x0600;
// const run = runWithInstructionSetAndSummary(INSTRUCTION_SET);

// const system = createBasicDevice();
// system.registers.PC = startingAddress;
// loadBytes(system.memory, programBytes3, startingAddress);
// run(system);
