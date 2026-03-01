const { createNsfPlayer } = require('../../nsf/player');
const { createNES } = require('../../devices/nes');
const { createInstructionSet } = require('../../6502/instructions');
const { buildAddress } = require('../../6502/memory');

describe('NSF Player', () => {
  const sentinelAddress = 0x0000;
  let system;
  let instructionSet;
  let player;

  beforeEach(() => {
    system = createNES();
    instructionSet = createInstructionSet();
    player = createNsfPlayer(system, instructionSet, sentinelAddress);
  });

  describe('When loading an NSF', () => {
    it('sets A register to songNumber - 1', () => {
      const nsf = {
        loadAddress: 0x8000,
        initAddress: 0x8000,
        musicData: new Uint8Array(),
      };

      player.loadNSF(nsf, 3);

      expect(system.registers.A).toBe(2);
    });

    it('sets X register to 0 for NTSC', () => {
      const nsf = {
        loadAddress: 0x8000,
        initAddress: 0x8000,
        musicData: [],
      };

      player.loadNSF(nsf, 1);

      expect(system.registers.X).toBe(0);
    });

    it('sets X register to 1 for PAL', () => {
      const nsf = {
        loadAddress: 0x8000,
        initAddress: 0x8000,
        isPAL: true,
        musicData: [],
      };

      player.loadNSF(nsf, 1);

      expect(system.registers.X).toBe(1);
    });

    it('executes init routine until RTS', () => {
      const nsf = {
        loadAddress: 0x8000,
        initAddress: 0x8000,
        musicData: new Uint8Array([
          // Just some arbitrary instructions I chose to test execution
          0xA9, 0x42,       // LDA #$42
          0x8D, 0x00, 0x02, // STA $0200
          0x60,             // RTS
        ]),
      };

      player.loadNSF(nsf, 1);

      expect(system.peek(system.memory, 0x0200)).toBe(0x42);
    });

    it('returns to sentinel address after RTS', () => {
      const nsf = {
        loadAddress: 0x8000,
        initAddress: 0x8000,
        musicData: new Uint8Array([0x60]), // Just RTS
      };

      player.loadNSF(nsf, 1);

      expect(system.registers.PC).toBe(sentinelAddress);
    });

    it('handles nested subroutine calls correctly', () => {
      const nsf = {
        loadAddress: 0x8000,
        initAddress: 0x8000,
        musicData: new Uint8Array([
          0x20, 0x10, 0x80, // JSR $8010
          0x60,             // RTS
          // padding
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          // $8010: subroutine
          0xA9, 0x99,       // LDA #$99
          0x8D, 0x00, 0x02, // STA $0200
          0x60,             // RTS
        ]),
      };

      player.loadNSF(nsf, 1);

      expect(system.peek(system.memory, 0x0200)).toBe(0x99);
      expect(system.registers.PC).toBe(sentinelAddress);
    });
  });

  describe('When playing', () => {
    it('executes play routine until RTS', () => {
      const nsf = {
        loadAddress: 0x8000,
        initAddress: 0x8000,
        playAddress: 0x8010,
        musicData: new Uint8Array(32).fill(0x00),
      };
      const targetAddressLowByte = 0x00;
      const targetAddressHighByte = 0x03;
      const targetAddress = buildAddress(targetAddressLowByte, targetAddressHighByte);
      // No-op init
      nsf.musicData[0] = 0x60;
      // Increment the value at $0300 each time play is called
      nsf.musicData[0x10] = 0xEE; // INC absolute
      nsf.musicData[0x11] = targetAddressLowByte;
      nsf.musicData[0x12] = targetAddressHighByte;
      nsf.musicData[0x13] = 0x60; // RTS

      player.loadNSF(nsf, 1);

      player.play(nsf);
      expect(system.peek(system.memory, targetAddress)).toBe(1);
      player.play(nsf);
      expect(system.peek(system.memory, targetAddress)).toBe(2);
      player.play(nsf);
      expect(system.peek(system.memory, targetAddress)).toBe(3);
    });
  });
});
