const Modes = require('../../6502/addressingModes');
const { when } = require('jest-when');

describe('addressingModes', () => {
  const op = jest.fn();
  const peek = jest.fn();
  const poke = jest.fn();

  const createSystem = () => ({
    registers: { PC: 0, A: 1 },
    memory: [],
    peek: peek,
    poke: poke,
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('immediate', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.registers.PC + 1;

      Modes.immediate(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should use next byte as operand', () => {
      const system = createSystem();
      const expected = 0xa;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValue(expected);

      const operand = Modes.immediate(system);
      expect(operand.read()).toEqual(expected);
    });
  });

  describe('implied', () => {
    it('does not change the execution context at all', () => {
      const testSystem = createSystem();
      const brandNewSystem = createSystem();

      Modes.implied(testSystem);

      expect(testSystem).toEqual(brandNewSystem);
    });
  });

  describe('accumulator', () => {
    it('should not advance the Program Counter at all', () => {
      const system = createSystem();
      const expected = system.registers.PC;

      Modes.accumulator(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should use accumulator as operand', () => {
      const system = createSystem();
      const expected = 42;

      system.registers.A = expected;

      const operand = Modes.accumulator(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update accumulator if operand was changed', () => {
      const system = createSystem();
      const expected = 42;
      const operand = Modes.accumulator(system);

      operand.write(expected);

      expect(system.registers.A).toBe(expected);
    });
  });

  describe('indirect', () => {
    it('should advance the Program Counter by 2', () => {
      const system = createSystem();
      const expected = system.registers.PC + 2;

      Modes.indirect(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the 16-bit address with LSB at specified address', () => {
      const system = createSystem();
      const lowByte = 0x04;
      const highByte = 0x42;
      const address = (highByte << 8) + lowByte;
      const expected = 42;
  
      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValue(lowByte);
      when(peek).calledWith(expect.anything(), system.registers.PC + 1).mockReturnValue(highByte);
      when(peek).calledWith(expect.anything(), address).mockReturnValue(expected);

      const operand = Modes.indirect(system);
      expect(operand.read()).toEqual(expected);
    });
  });

  describe('indexedIndirect', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.registers.PC + 1;

      Modes.indexedIndirect(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the peeked data at the address indicated by the specified X-offset zero-page address', () => {
      const system = createSystem();
      const zeroPageAddress = 0x04;
      const targetLowByte = 0x25;
      const targetHighByte = 0x22;
      const expected = 0xa;

      system.registers.X = 0x05;
  
      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(zeroPageAddress);
      when(peek).calledWith(expect.anything(), zeroPageAddress + system.registers.X).mockReturnValueOnce(targetLowByte);
      when(peek).calledWith(expect.anything(), zeroPageAddress + system.registers.X + 1).mockReturnValueOnce(targetHighByte);
      when(peek).calledWith(expect.anything(), (targetHighByte << 8) + targetLowByte).mockReturnValueOnce(expected);

      const operand = Modes.indexedIndirect(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;
      const lowByte = 0x12;
      const highByte = 0x34;
      const targetAddress = (highByte << 8) + lowByte;

      system.registers.X = 0xFF;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), (address + system.registers.X) & 0xFF).mockReturnValueOnce(lowByte);
      when(peek).calledWith(expect.anything(), ((address + system.registers.X) & 0xFF) + 1).mockReturnValueOnce(highByte);
      when(peek).calledWith(expect.anything(), targetAddress).mockReturnValueOnce(expected);

      const operand = Modes.indexedIndirect(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;
  
      const operand = Modes.indexedIndirect(system);
      operand.write(expected);
      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('indirectIndexed', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.registers.PC + 1;

      Modes.indirectIndexed(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the peeked data at the Y-offset address indicated by the specified zero-page address', () => {
      const system = createSystem();
      const zeroPageAddress = 0x04;
      const targetLowByte = 0x25;
      const targetHighByte = 0x22;
      const expected = 0xa;

      system.registers.Y = 0x05;
  
      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(zeroPageAddress);
      when(peek).calledWith(expect.anything(), zeroPageAddress).mockReturnValueOnce(targetLowByte);
      when(peek).calledWith(expect.anything(), zeroPageAddress + 1).mockReturnValueOnce(targetHighByte);
      when(peek).calledWith(expect.anything(), (targetHighByte << 8) + targetLowByte + system.registers.Y).mockReturnValueOnce(expected);

      const operand = Modes.indirectIndexed(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      const operand = Modes.indirectIndexed(system);
      operand.write(expected);

      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });
  
  describe('absolute', () => {
    it('should advance the Program Counter by 2', () => {
      const system = createSystem();
      const expected = system.registers.PC + 2;

      Modes.absolute(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified address', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;
  
      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(lowByte);
      when(peek).calledWith(expect.anything(), system.registers.PC + 1).mockReturnValueOnce(highByte);
      when(peek).calledWith(expect.anything(), (highByte << 8) + lowByte).mockReturnValue(expected);

      const operand = Modes.absolute(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      const operand = Modes.absolute(system);
      operand.write(expected);

      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('absoluteX', () => {
    it('should advance the Program Counter by 2', () => {
      const system = createSystem();
      const expected = system.registers.PC + 2;

      Modes.absoluteX(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified address offset with the value stored in register X', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;

      system.registers.X = 42;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(lowByte);
      when(peek).calledWith(expect.anything(), system.registers.PC + 1).mockReturnValueOnce(highByte);
      when(peek).calledWith(expect.anything(), (highByte << 8) + lowByte + system.registers.X).mockReturnValue(expected);

      const operand = Modes.absoluteX(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      const operand = Modes.absoluteX(system);
      operand.write(expected);

      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('absoluteY', () => {
    it('should advance the Program Counter by 2', () => {
      const system = createSystem();
      const expected = system.registers.PC + 2;

      Modes.absoluteY(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified address offset with the value stored in register Y', () => {
      const system = createSystem();
      const expected = 0xa;
      const lowByte = 0x04;
      const highByte = 0x42;

      system.registers.Y = 42;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(lowByte);
      when(peek).calledWith(expect.anything(), system.registers.PC + 1).mockReturnValueOnce(highByte);
      when(peek).calledWith(expect.anything(), (highByte << 8) + lowByte + system.registers.Y).mockReturnValue(expected);

      const operand = Modes.absoluteY(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      const operand = Modes.absoluteY(system);
      operand.write(expected);

      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('relative', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.registers.PC + 1;

      Modes.relative(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should use next byte as operand', () => {
      const system = createSystem();
      const expected = 0xa;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValue(expected);

      const operand = Modes.relative(system);
      expect(operand.read()).toEqual(expected);
    });
  });

  describe('zeroPage', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.registers.PC + 1;

      Modes.zeroPage(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified zero page address', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), address).mockReturnValue(expected);

      const operand = Modes.zeroPage(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      const operand = Modes.zeroPage(system);
      operand.write(expected);
      
      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('zeroPageX', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.registers.PC + 1;

      Modes.zeroPageX(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified zero page address offset by the value in register X', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      system.registers.X = 42;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), address + system.registers.X).mockReturnValue(expected);

      const operand = Modes.zeroPageX(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;

      system.registers.X = 0xFF;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), (address + system.registers.X) & 0xFF).mockReturnValue(expected);

      const operand = Modes.zeroPageX(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      const operand = Modes.zeroPageX(system);
      operand.write(expected);

      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });

  describe('zeroPageY', () => {
    it('should advance the Program Counter by 1', () => {
      const system = createSystem();
      const expected = system.registers.PC + 1;

      Modes.zeroPageY(system);

      expect(system.registers.PC).toBe(expected);
    });
  
    it('should return the peeked data at the specified zero page address offset by the value in register Y', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x04;

      system.registers.Y = 42;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), address + system.registers.Y).mockReturnValue(expected);

      const operand = Modes.zeroPageY(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should wrap if the offset overflows', () => {
      const system = createSystem();
      const expected = 0xa;
      const address = 0x80;

      system.registers.Y = 0xFF;

      when(peek).calledWith(expect.anything(), system.registers.PC).mockReturnValueOnce(address);
      when(peek).calledWith(expect.anything(), (address + system.registers.Y) & 0xFF).mockReturnValue(expected);

      const operand = Modes.zeroPageY(system);
      expect(operand.read()).toEqual(expected);
    });

    it('should update memory contents to operand', () => {
      const system = createSystem();
      const expected = 42;

      const operand = Modes.zeroPageY(system);
      operand.write(expected);

      expect(poke).toHaveBeenCalledWith(expect.anything(), expect.anything(), expected);
    });
  });
});
