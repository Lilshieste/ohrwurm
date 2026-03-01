const fetchDecodeExecute = (system, instructionSet, { preFetch, preDecode, preExecute, postExecute, cycles: cycleTable } = {}) => {
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
    decoded.instruction(system);
    if(postExecute)
      postExecute(decoded);
    return decoded.opCode;
  }

  const opCode = execute(decode(fetch()));
  const cycles = cycleTable ? cycleTable[opCode] : 0;
  return { isBrk: opCode === 0x00, cycles };
};

const start = (system, instructionSet, hooks = {}, maxBreakCount = 0) => {
  let breakCount = 0;
  while(breakCount <= maxBreakCount) {
    const { isBrk } = fetchDecodeExecute(system, instructionSet, hooks);
    if (isBrk) breakCount++;
  }
};

module.exports = {
  fetchDecodeExecute,
  start,
};
