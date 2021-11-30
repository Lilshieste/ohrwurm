const { peek, read } = require('./system');

const buildAddress = (lowByte, highByte) => (highByte << 8) + lowByte;

const immediate = (system) => read(system);

const absolute = (system) => {
	const addressLow = read(system);
	const addressHigh = read(system);
	return peek(system, buildAddress(addressLow, addressHigh));
};

const absoluteX = (system) => {
	const addressLow = read(system);
	const addressHigh = read(system);
	return peek(system, buildAddress(addressLow, addressHigh) + system.cpu.X);
};

const absoluteY = (system) => {
	const addressLow = read(system);
	const addressHigh = read(system);
	return peek(system, buildAddress(addressLow, addressHigh) + system.cpu.Y);
};

const zeroPage = (system) => {
	const address = read(system);
	return peek(system, buildAddress(address, 0x00));
};

const zeroPageX = (system) => {
	const address = read(system);
	return peek(system, buildAddress(address, 0x00) + system.cpu.X);
};

module.exports = {
  immediate,
  absolute,
  absoluteX,
  absoluteY,
  zeroPage,
  zeroPageX,
};