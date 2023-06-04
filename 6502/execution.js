const fetchDecodeExecute = (system, instructionSet, { preFetch, preDecode, preExecute, postExecute }) => {
  const fetch = () => {
    if(preFetch)
      preFetch();
    return system.peek(system.memory, system.registers.PC++);
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
  while(!system.registers.B) {
    fetchDecodeExecute(system, instructionSet, hooks);
  }
};

module.exports = {
  start,
};
