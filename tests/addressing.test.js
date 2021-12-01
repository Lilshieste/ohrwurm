const Mode = require('../addressing');
const { createSystem, peek, read } = require('../system');
const System = require('../system');

jest.mock('../system', () => ({
  ...jest.requireActual('../system'),
  peek: jest.fn(),
  read: jest.fn(),
}));

describe('addressingModes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('immediate', () => {
    it('should read 1 byte for the operand', () => {
      Mode.immediate(createSystem());

      expect(read).toHaveBeenCalledTimes(1);
    });
  
    it('should read and return the next byte ', () => {
      const system = createSystem();
      const expected = 0xa;

      read.mockReturnValueOnce(expected);

      expect(Mode.immediate(system)).toBe(expected);
    });
  });

  describe('indirect', () => {
    it('should read 1 bytes for the operand', () => {
      Mode.indirect(createSystem());

      expect(read).toHaveBeenCalledTimes(1);
    });
  
    it('should return the 16-bit address with LSB at specified address', () => {
      const system = createSystem();
      const lowByte = 0x04;
      const highByte = 0x42;
      const expected = (highByte << 8) + lowByte;
  
      read.mockReturnValueOnce(lowByte);
      peek.mockReturnValue(highByte);

      const actual = Mode.indirect(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, system.cpu.PC + 1);
    });
  });

  describe('indexedIndirect', () => {
    it('should read 1 bytes for the operand', () => {
      Mode.indexedIndirect(createSystem());

      expect(read).toHaveBeenCalledTimes(1);
    });
  
    it('should return the peeked data at the address indicated by the specified X-offset zero-page address', () => {
      const system = createSystem();
      const zeroPageAddress = 0x04;
      const targetLowByte = 0x25;
      const targetHighByte = 0x22;
      const expected = 0xa;

      system.cpu.X = 0x05;
  
      read.mockReturnValueOnce(zeroPageAddress);
      peek.mockReturnValueOnce(targetLowByte);
      peek.mockReturnValueOnce(targetHighByte);
      peek.mockReturnValueOnce(expected);

      const actual = Mode.indexedIndirect(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, zeroPageAddress + system.cpu.X);
      expect(peek).toHaveBeenCalledWith(system, zeroPageAddress + system.cpu.X + 1);
      expect(peek).toHaveBeenCalledWith(system, (targetHighByte << 8) + targetLowByte);
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;
      const lowByte = 0x12;
      const highByte = 0x34;
      const targetAddress = (highByte << 8) + lowByte;

      system.cpu.X = 0xFF;

      read.mockReturnValueOnce(address);
      peek.mockReturnValueOnce(lowByte);
      peek.mockReturnValueOnce(highByte);
      peek.mockReturnValue(expected);

      const actual = Mode.indexedIndirect(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, (address + system.cpu.X) & 0xFF);
      expect(peek).toHaveBeenCalledWith(system, (address + system.cpu.X) & 0xFF) + 1;
      expect(peek).toHaveBeenCalledWith(system, targetAddress);
    });
  });

  describe('indirectIndexed', () => {
    it('should read 1 bytes for the operand', () => {
      Mode.indirectIndexed(createSystem());

      expect(read).toHaveBeenCalledTimes(1);
    });
  
    it('should return the peeked data at the Y-offset address indicated by the specified zero-page address', () => {
      const system = createSystem();
      const zeroPageAddress = 0x04;
      const targetLowByte = 0x25;
      const targetHighByte = 0x22;
      const expected = 0xa;

      system.cpu.Y = 0x05;
  
      read.mockReturnValueOnce(zeroPageAddress);
      peek.mockReturnValueOnce(targetLowByte);
      peek.mockReturnValueOnce(targetHighByte);
      peek.mockReturnValueOnce(expected);

      const actual = Mode.indirectIndexed(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, zeroPageAddress);
      expect(peek).toHaveBeenCalledWith(system, zeroPageAddress + 1);
      expect(peek).toHaveBeenCalledWith(system, (targetHighByte << 8) + targetLowByte + system.cpu.Y);
    });
  });
  
  describe('absolute', () => {
    it('should read 2 bytes for the operand', () => {
      Mode.absolute(createSystem());

      expect(read).toHaveBeenCalledTimes(2);
    });
  
    it('should return the peeked data at the specified address', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;
  
      read.mockReturnValueOnce(lowByte);
      read.mockReturnValueOnce(highByte);
      peek.mockReturnValue(expected);

      const actual = Mode.absolute(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, (highByte << 8) + lowByte);
    });
  });

  describe('absoluteX', () => {
    it('should read 2 bytes for the operand', () => {
      Mode.absoluteX(createSystem());

      expect(read).toHaveBeenCalledTimes(2);
    });
  
    it('should return the peeked data at the specified address offset with the value stored in register X', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;

      system.cpu.X = 42;

      read.mockReturnValueOnce(lowByte);
      read.mockReturnValueOnce(highByte);
      peek.mockReturnValue(expected);

      const actual = Mode.absoluteX(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, (highByte << 8) + lowByte + system.cpu.X);
    });
  });

  describe('absoluteY', () => {
    it('should read 2 bytes for the operand', () => {
      Mode.absoluteY(createSystem());

      expect(read).toHaveBeenCalledTimes(2);
    });
  
    it('should return the peeked data at the specified address offset with the value stored in register Y', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;

      system.cpu.Y = 42;

      read.mockReturnValueOnce(lowByte);
      read.mockReturnValueOnce(highByte);
      peek.mockReturnValue(expected);

      const actual = Mode.absoluteY(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, (highByte << 8) + lowByte + system.cpu.Y);
    });
  });

  describe('zeroPage', () => {
    it('should read 1 byte for the operand', () => {
      Mode.zeroPage(createSystem());

      expect(read).toHaveBeenCalledTimes(1);
    });
  
    it('should return the peeked data at the specified zero page address', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      read.mockReturnValueOnce(address);
      peek.mockReturnValue(expected);

      const actual = Mode.zeroPage(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, address);
    });
  });

  describe('zeroPageX', () => {
    it('should read 1 byte for the operand', () => {
      Mode.zeroPageX(createSystem());

      expect(read).toHaveBeenCalledTimes(1);
    });
  
    it('should return the peeked data at the specified zero page address offset by the value in register X', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      system.cpu.X = 42;

      read.mockReturnValueOnce(address);
      peek.mockReturnValue(expected);

      const actual = Mode.zeroPageX(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, address + system.cpu.X);
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;

      system.cpu.X = 0xFF;

      read.mockReturnValueOnce(address);
      peek.mockReturnValue(expected);

      const actual = Mode.zeroPageX(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, (address + system.cpu.X) & 0xFF);
    });
  });

  describe('zeroPageY', () => {
    it('should read 1 byte for the operand', () => {
      Mode.zeroPageY(createSystem());

      expect(read).toHaveBeenCalledTimes(1);
    });
  
    it('should return the peeked data at the specified zero page address offset by the value in register Y', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      system.cpu.Y = 42;

      read.mockReturnValueOnce(address);
      peek.mockReturnValue(expected);

      const actual = Mode.zeroPageY(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, address + system.cpu.Y);
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;

      system.cpu.Y = 0xFF;

      read.mockReturnValueOnce(address);
      peek.mockReturnValue(expected);

      const actual = Mode.zeroPageY(system);
      expect(actual).toBe(expected);
      expect(peek).toHaveBeenCalledWith(system, (address + system.cpu.Y) & 0xFF);
    });
  });
});



