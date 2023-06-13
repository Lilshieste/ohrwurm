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
    decoded.instruction(system);
    if(postExecute)
      postExecute(decoded);
    return decoded.opCode;
  }

  return execute(decode(fetch())) === 0x00;
};

const start = (system, instructionSet, hooks = false, maxBreakCount = 0) => {
  let breakCount = 0;
  while(breakCount <= maxBreakCount) {
    breakCount += fetchDecodeExecute(system, instructionSet, hooks);
  }
};

module.exports = {
  start,
};
