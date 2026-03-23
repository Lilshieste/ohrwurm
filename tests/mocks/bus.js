const createMockBus = () => ({
  read: jest.fn(),
  write: jest.fn(),
});

module.exports = { createMockBus };
