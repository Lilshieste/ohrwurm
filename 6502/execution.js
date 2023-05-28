const fetchDecodeExecute = (system, instructionSet) => {
  const fetch = () => system.peekFn(system.memory, system.registers.PC++);
  const decode = (byte) => instructionSet[byte];
  const execute = (instruction) => instruction(system)

  execute(decode(fetch()));
}

const fetchDecodeExecuteWithHooks = (system, instructionSet, { preFetch, preDecode, preExecute, postExecute }) => {
  const fetch = () => {
    if(preFetch)
      preFetch();
    return system.peekFn(system.memory, system.registers.PC++);
  };
  const decode = (byte) => {
    if(preDecode)
      preDecode(byte);
    return { opCode: byte, instruction: instructionSet[byte] };
  };
  const execute = (decoded) => {
    if(preExecute)
      preExecute(decoded);
    const result = decoded.instruction(system);
    if(postExecute)
      postExecute(decoded);
    return result;
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
