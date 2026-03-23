const createMockDevice = () => {
  const values = {};
  return {
    read: jest.fn((address) => values[address] || 0),
    write: jest.fn((address, value) => { values[address] = value; }),
    values,
  };
};

module.exports = { createMockDevice };
