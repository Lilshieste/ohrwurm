const { read } = require('./memory');

const run = (system, execute) => {
  while(!system.registers.B) {
    execute(read(system), system);
  }
};

const executeFromInstructionSet = (instructionSet) => (instruction, system) => instructionSet[instruction](system);
const runWithInstructionSet = (instructionSet) => (system) => run(system, executeFromInstructionSet(instructionSet));

module.exports = {
  executeFromInstructionSet,
  run,
  runWithInstructionSet,
};
