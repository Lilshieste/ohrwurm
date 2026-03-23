const createMockAPU = () => ({
  readStatus: jest.fn(),
  writeRegister: jest.fn(),
  clock: jest.fn(),
  getSamples: jest.fn(),
  reset: jest.fn(),
  setChannelMute: jest.fn(),
  getChannelMutes: jest.fn(),
});

module.exports = { createMockAPU };
