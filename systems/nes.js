const { createRegisters } = require('../cores/cpu_6502/registers');
const { pull, push } = require('../cores/cpu_6502/memory');
const { createBus } = require('../memory/bus');
const { createRAMDevice } = require('../memory/ram');
const { createPPUDevice } = require('../cores/ppu/ppu');
const { createAPUDevice } = require('../cores/apu/apuDevice');
const { createAPUTestModeDevice } = require('../memory/apuTestMode');
const { createCartridgeDevice } = require('../cartridge/cartridge');

const createNES = (deps = {}) => {
  // Create devices (allow injection for testing)
  const ram = deps.ram ?? createRAMDevice();
  const ppu = deps.ppu ?? createPPUDevice();
  const apu = deps.apu ?? createAPUDevice();
  const apuTestMode = deps.apuTestMode ?? createAPUTestModeDevice();
  const cartridge = deps.cartridge ?? createCartridgeDevice();

  // Create bus with all devices (allow injection for testing)
  const bus = deps.bus ?? createBus({ ram, ppu, apu, apuTestMode, cartridge });

  // Wrapper functions that maintain existing API signature
  const peek = (memory, address) => memory.read(address);
  const poke = (memory, address, value) => memory.write(address, value);

  return {
    registers: createRegisters(),
    memory: bus,
    apu,

    peek,
    poke,
    pull: pull(peek),
    push: push(poke),
  };
};

module.exports = { createNES };
