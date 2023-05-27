const fetchDecodeExecute = (system, instructionSet) => {
  const fetch = () => system.peekFn(system.memory, system.registers.PC++);
  const decode = (byte) => instructionSet[byte];
  const execute = (instruction) => instruction(system)

  execute(decode(fetch()));
}

const fetchDecodeExecuteWithHooks = (system, instructionSet, { preFetch, preDecode, preExecute }) => {
  const fetch = () => {
    if(preFetch)
      preFetch();
    return system.peekFn(system.memory, system.registers.PC++);
  };
  const decode = (byte) => {
    if(preDecode)
      preDecode(byte);
    return instructionSet[byte];
  };
  const execute = (instruction) => {
    if(preExecute)
      preExecute(instruction);
    return instruction(system);
  }

  execute(decode(fetch()));
};

const start = (system, instructionSet, hooks = false) => {
  const cycle = hooks ? fetchDecodeExecuteWithHooks : fetchDecodeExecute;
  while(!system.registers.B) {
    cycle(system, instructionSet, hooks);
  }
};

module.exports = {
  start,
};
