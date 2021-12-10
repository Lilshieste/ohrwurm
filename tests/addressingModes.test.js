const Modes = require('../addressingModes');
const { when } = require('jest-when');

describe('addressingModes', () => {
  const op = jest.fn();
  const peek = jest.fn();
  const poke = jest.fn();

  const createSystem = () => ({ cpu: { PC: 0, A: 1 } });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('immediate', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 1;

      Modes.immediate(peek)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should use next byte as operand', () => {
      const system = createSystem();
      const expected = 0xa;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValue(expected);

      Modes.immediate(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });
  });

  describe('accumulator', () => {
    it('should not advance the Program Counter at all', () => {
      const system = createSystem();
      const expected = system.cpu.PC;

      Modes.accumulator(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should use accumulator as operand', () => {
      const system = createSystem();

      Modes.accumulator(system, op);
      expect(op).toHaveBeenCalledWith({ operand: system.cpu.A });
    });

    it('should update accumulator if operand was changed', () => {
      const system = createSystem();
      const expected = 42;

      op.mockImplementation(context => context.operand = expected);

      Modes.accumulator(system, op);
      expect(system.cpu.A).toBe(expected);
    });
  });

  describe('indirect', () => {
    it('should advance the Program Counter by 2', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 2;

      Modes.indirect(peek)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the 16-bit address with LSB at specified address', () => {
      const system = createSystem();
      const lowByte = 0x04;
      const highByte = 0x42;
      const expected = (highByte << 8) + lowByte;
  
      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValue(lowByte);
      when(peek).calledWith(expect.anything(), system.cpu.PC + 1).mockReturnValue(highByte);

      Modes.indirect(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
      //expect(peek).toHaveBeenCalledWith(128);
    });
  });

  describe('indexedIndirect', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 1;

      Modes.indexedIndirect(peek)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the peeked data at the address indicated by the specified X-offset zero-page address', () => {
      const system = createSystem();
      const zeroPageAddress = 0x04;
      const targetLowByte = 0x25;
      const targetHighByte = 0x22;
      const expected = 0xa;

      system.cpu.X = 0x05;
  
      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(zeroPageAddress);
      when(peek).calledWith(expect.anything(), zeroPageAddress + system.cpu.X).mockReturnValueOnce(targetLowByte);
      when(peek).calledWith(expect.anything(), zeroPageAddress + system.cpu.X + 1).mockReturnValueOnce(targetHighByte);
      when(peek).calledWith(expect.anything(), (targetHighByte << 8) + targetLowByte).mockReturnValueOnce(expected);

      Modes.indexedIndirect(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;
      const lowByte = 0x12;
      const highByte = 0x34;
      const targetAddress = (highByte << 8) + lowByte;

      system.cpu.X = 0xFF;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), (address + system.cpu.X) & 0xFF).mockReturnValueOnce(lowByte);
      when(peek).calledWith(expect.anything(), ((address + system.cpu.X) & 0xFF) + 1).mockReturnValueOnce(highByte);
      when(peek).calledWith(expect.anything(), targetAddress).mockReturnValueOnce(expected);

      Modes.indexedIndirect(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });
  });

  describe('indirectIndexed', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 1;

      Modes.indirectIndexed(peek)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the peeked data at the Y-offset address indicated by the specified zero-page address', () => {
      const system = createSystem();
      const zeroPageAddress = 0x04;
      const targetLowByte = 0x25;
      const targetHighByte = 0x22;
      const expected = 0xa;

      system.cpu.Y = 0x05;
  
      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(zeroPageAddress);
      when(peek).calledWith(expect.anything(), zeroPageAddress).mockReturnValueOnce(targetLowByte);
      when(peek).calledWith(expect.anything(), zeroPageAddress + 1).mockReturnValueOnce(targetHighByte);
      when(peek).calledWith(expect.anything(), (targetHighByte << 8) + targetLowByte + system.cpu.Y).mockReturnValueOnce(expected);

      Modes.indirectIndexed(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });
  });
  
  describe('absolute', () => {
    it('should advance the Program Counter by 2', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 2;

      Modes.absolute(peek, poke)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified address', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;
  
      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(lowByte);
      when(peek).calledWith(expect.anything(), system.cpu.PC + 1).mockReturnValueOnce(highByte);
      when(peek).calledWith(expect.anything(), (highByte << 8) + lowByte).mockReturnValue(expected);

      Modes.absolute(peek, poke)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      op.mockImplementation(context => context.operand = expected);
  
      Modes.absolute(peek, poke)(system, op);
      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('absoluteX', () => {
    it('should advance the Program Counter by 2', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 2;

      Modes.absoluteX(peek, poke)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified address offset with the value stored in register X', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;

      system.cpu.X = 42;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(lowByte);
      when(peek).calledWith(expect.anything(), system.cpu.PC + 1).mockReturnValueOnce(highByte);
      when(peek).calledWith(expect.anything(), (highByte << 8) + lowByte + system.cpu.X).mockReturnValue(expected);

      Modes.absoluteX(peek, poke)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      op.mockImplementation(context => context.operand = expected);
  
      Modes.absoluteX(peek, poke)(system, op);
      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('absoluteY', () => {
    it('should advance the Program Counter by 2', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 2;

      Modes.absoluteY(peek)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified address offset with the value stored in register Y', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;

      system.cpu.Y = 42;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(lowByte);
      when(peek).calledWith(expect.anything(), system.cpu.PC + 1).mockReturnValueOnce(highByte);
      when(peek).calledWith(expect.anything(), (highByte << 8) + lowByte + system.cpu.Y).mockReturnValue(expected);

      Modes.absoluteY(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });
  });

  describe('relative', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 1;

      Modes.relative(peek)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should use next byte as operand', () => {
      const system = createSystem();
      const expected = 0xa;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValue(expected);

      Modes.relative(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });
  });

  describe('zeroPage', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 1;

      Modes.zeroPage(peek, poke)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified zero page address', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), address).mockReturnValue(expected);

      Modes.zeroPage(peek, poke)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      op.mockImplementation(context => context.operand = expected);
  
      Modes.zeroPage(peek, poke)(system, op);
      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('zeroPageX', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 1;

      Modes.zeroPageX(peek, poke)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified zero page address offset by the value in register X', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      system.cpu.X = 42;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), address + system.cpu.X).mockReturnValue(expected);

      Modes.zeroPageX(peek, poke)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;

      system.cpu.X = 0xFF;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), (address + system.cpu.X) & 0xFF).mockReturnValue(expected);

      Modes.zeroPageX(peek, poke)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      op.mockImplementation(context => context.operand = expected);
  
      Modes.zeroPageX(peek, poke)(system, op);
      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('zeroPageY', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.cpu.PC + 1;

      Modes.zeroPageY(peek)(system, op);

      expect(system.cpu.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified zero page address offset by the value in register Y', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      system.cpu.Y = 42;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), address + system.cpu.Y).mockReturnValue(expected);

      Modes.zeroPageY(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;

      system.cpu.Y = 0xFF;

      when(peek).calledWith(expect.anything(), system.cpu.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), (address + system.cpu.Y) & 0xFF).mockReturnValue(expected);

      Modes.zeroPageY(peek)(system, op);
      expect(op).toHaveBeenCalledWith({ operand: expected });
    });
  });
});
