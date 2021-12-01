const { peek, read } = require('./system');

const buildAddress = (lowByte, highByte) => (highByte << 8) + lowByte;

const immediate = (system) => read(system);

const indirect = (system) => {
	const lowByte = read(system);
	const highByte = peek(system, system.cpu.PC + 1);
	return buildAddress(lowByte, highByte);
};

const indexedIndirect = (system) => {
  const zeroPageAddress = read(system);
  const zeroPageAddressWithOffset = (zeroPageAddress + system.cpu.X) & 0xFF;
	const lowByte = peek(system, zeroPageAddressWithOffset);
	const highByte = peek(system, zeroPageAddressWithOffset + 1);
	return peek(system, buildAddress(lowByte, highByte));
};

const indirectIndexed = (system) => {
  const zeroPageAddress = read(system);
	const lowByte = peek(system, zeroPageAddress);
	const highByte = peek(system, zeroPageAddress + 1);
  const targetAddress = buildAddress(lowByte, highByte) + system.cpu.Y;
	return peek(system, targetAddress);
};

const absolute = (system) => {
	const lowByte = read(system);
	const highByte = read(system);
	return peek(system, buildAddress(lowByte, highByte));
};

const absoluteX = (system) => {
	const lowByte = read(system);
	const highByte = read(system);
	return peek(system, buildAddress(lowByte, highByte) + system.cpu.X);
};

const absoluteY = (system) => {
	const lowByte = read(system);
	const highByte = read(system);
	return peek(system, buildAddress(lowByte, highByte) + system.cpu.Y);
};

const zeroPage = (system) => {
	const address = read(system);
	return peek(system, buildAddress(address, 0x00));
};

const zeroPageX = (system) => {
	const address = read(system);
	return peek(system, (buildAddress(address, 0x00) + system.cpu.X) & 0xFF);
};

const zeroPageY = (system) => {
	const address = read(system);
	return peek(system, (buildAddress(address, 0x00) + system.cpu.Y) & 0xFF);
};

module.exports = {
  immediate,
  indirect,
  indexedIndirect,
  indirectIndexed,
  absolute,
  absoluteX,
  absoluteY,
  zeroPage,
  zeroPageX,
  zeroPageY,
};