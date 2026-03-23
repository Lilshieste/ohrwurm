const createRegisters = () => ({
  A: 0,
  X: 0,
  Y: 0,

  PC: 0x0000,
  SP: 0xFF,

  N: false,
  V: false,
  B: false,
  D: false,
  I: false,
  Z: false,
  C: false,
});

module.exports = {
  createRegisters,
};
