const { cycleCounts } = require('../../cores/cpu_6502/cycleCounts');

describe('Cycle counts', () => {
  describe('basic opcodes', () => {
    it('NOP takes 2 cycles', () => {
      expect(cycleCounts[0xEA]).toBe(2);
    });

    it('LDA immediate takes 2 cycles', () => {
      expect(cycleCounts[0xA9]).toBe(2);
    });

    it('LDA absolute takes 4 cycles', () => {
      expect(cycleCounts[0xAD]).toBe(4);
    });

    it('LDA zero page takes 3 cycles', () => {
      expect(cycleCounts[0xA5]).toBe(3);
    });
  });

  describe('branching opcodes', () => {
    it('BEQ takes 2 cycles (not taken)', () => {
      expect(cycleCounts[0xF0]).toBe(2);
    });

    it('BNE takes 2 cycles (not taken)', () => {
      expect(cycleCounts[0xD0]).toBe(2);
    });

    it('JMP absolute takes 3 cycles', () => {
      expect(cycleCounts[0x4C]).toBe(3);
    });

    it('JMP indirect takes 5 cycles', () => {
      expect(cycleCounts[0x6C]).toBe(5);
    });
  });

  describe('subroutine opcodes', () => {
    it('JSR takes 6 cycles', () => {
      expect(cycleCounts[0x20]).toBe(6);
    });

    it('RTS takes 6 cycles', () => {
      expect(cycleCounts[0x60]).toBe(6);
    });

    it('RTI takes 6 cycles', () => {
      expect(cycleCounts[0x40]).toBe(6);
    });

    it('BRK takes 7 cycles', () => {
      expect(cycleCounts[0x00]).toBe(7);
    });
  });

  describe('stack opcodes', () => {
    it('PHA takes 3 cycles', () => {
      expect(cycleCounts[0x48]).toBe(3);
    });

    it('PLA takes 4 cycles', () => {
      expect(cycleCounts[0x68]).toBe(4);
    });

    it('PHP takes 3 cycles', () => {
      expect(cycleCounts[0x08]).toBe(3);
    });

    it('PLP takes 4 cycles', () => {
      expect(cycleCounts[0x28]).toBe(4);
    });
  });

  describe('store opcodes', () => {
    it('STA absolute takes 4 cycles', () => {
      expect(cycleCounts[0x8D]).toBe(4);
    });

    it('STA zero page takes 3 cycles', () => {
      expect(cycleCounts[0x85]).toBe(3);
    });

    it('STX absolute takes 4 cycles', () => {
      expect(cycleCounts[0x8E]).toBe(4);
    });

    it('STY absolute takes 4 cycles', () => {
      expect(cycleCounts[0x8C]).toBe(4);
    });
  });

  describe('increment/decrement opcodes', () => {
    it('INC absolute takes 6 cycles', () => {
      expect(cycleCounts[0xEE]).toBe(6);
    });

    it('INC zero page takes 5 cycles', () => {
      expect(cycleCounts[0xE6]).toBe(5);
    });

    it('INX takes 2 cycles', () => {
      expect(cycleCounts[0xE8]).toBe(2);
    });

    it('INY takes 2 cycles', () => {
      expect(cycleCounts[0xC8]).toBe(2);
    });

    it('DEX takes 2 cycles', () => {
      expect(cycleCounts[0xCA]).toBe(2);
    });

    it('DEY takes 2 cycles', () => {
      expect(cycleCounts[0x88]).toBe(2);
    });
  });
});
