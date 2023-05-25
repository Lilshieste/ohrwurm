const {
  buildStatusByte,
} = require('./memory');
const {
  executeFromInstructionSet,
  run,
} = require('../execution');

const hex = (value) => `$${value.toString(16)}`;
const hex16 = (value) => `$${value.toString(16).padStart(4, 0)}`;
const headerWithOpCode = () => `OpCode\t\tA\t\tX\t\tY\t\tPC\t\tSP\t\tNV-BDIZC`;
const stateWithOpCode = (system, opCode) => `${hex(opCode)}\t\t${hex(system.registers.A)}\t\t${hex(system.registers.X)}\t\t${hex(system.registers.Y)}\t\t${hex16(system.registers.PC)}\t\t${hex(system.registers.SP)}\t\t${buildStatusByte(system.registers).toString(2).padStart(8, 0)}`;

const runWithSummary = (system, execute) => {
  const messages = [headerWithOpCode()];
  const executeAndLog = (instruction, system) => {
    execute(instruction, system);
    messages.push(stateWithOpCode(system.memory, system.registers, instruction))
  };
  run(system, executeAndLog);
  console.log(messages.join('\n'));
};

const runWithInstructionSetAndSummary = (instructionSet) => (system) => runWithSummary(system, executeFromInstructionSet(instructionSet));

module.exports = {
  runWithSummary,
  runWithInstructionSetAndSummary,
};
