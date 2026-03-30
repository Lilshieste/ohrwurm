const { createDMCChannel } = require('../../../systems/nes/apu/channels/dmc');

describe('DMC Channel', () => {
  describe('register writes', () => {
    describe('$4010 - Control', () => {
      it('should set loop flag from bit 6', () => {
        const dmc = createDMCChannel();
        const mockReader = jest.fn().mockReturnValue(0xFF);
        dmc.setMemoryReader(mockReader);

        // Set up a short sample
        dmc.writeSampleAddress(0); // $C000
        dmc.writeSampleLength(0); // 1 byte

        // Enable with loop flag
        dmc.writeControl(0x40); // Loop flag set
        dmc.setEnabled(true);

        // Clock through the sample
        for (let i = 0; i < 10000; i++) {
          dmc.clockTimer();
        }

        // With loop flag, sample should restart and read again
        expect(mockReader.mock.calls.length).toBeGreaterThan(1);
      });

      it('should set rate from lower 4 bits', () => {
        const dmc = createDMCChannel();
        const mockReader = jest.fn().mockReturnValue(0x55);
        dmc.setMemoryReader(mockReader);
        dmc.writeSampleAddress(0);
        dmc.writeSampleLength(0); // 1 byte
        dmc.setEnabled(true);

        // Rate index 0 = 428 cycles per output
        dmc.writeControl(0x00);
        let fires = 0;
        for (let i = 0; i < 1000; i++) {
          if (dmc.clockTimer()) fires++;
        }
        const slowFires = fires;

        // Reset and try fastest rate (index 15 = 54 cycles)
        const dmc2 = createDMCChannel();
        dmc2.setMemoryReader(jest.fn().mockReturnValue(0x55));
        dmc2.writeSampleAddress(0);
        dmc2.writeSampleLength(0);
        dmc2.writeControl(0x0F); // Rate index 15
        dmc2.setEnabled(true);
        fires = 0;
        for (let i = 0; i < 1000; i++) {
          if (dmc2.clockTimer()) fires++;
        }
        const fastFires = fires;

        // Faster rate should fire more often
        expect(fastFires).toBeGreaterThan(slowFires);
      });
    });

    describe('$4011 - Direct Load', () => {
      it('should directly set output level (7-bit)', () => {
        const dmc = createDMCChannel();

        dmc.writeDirectLoad(0x40); // 64
        expect(dmc.getOutput()).toBe(64);

        dmc.writeDirectLoad(0x7F); // 127 (max)
        expect(dmc.getOutput()).toBe(127);

        dmc.writeDirectLoad(0x00); // 0
        expect(dmc.getOutput()).toBe(0);
      });

      it('should mask to 7 bits', () => {
        const dmc = createDMCChannel();

        dmc.writeDirectLoad(0xFF); // Only lower 7 bits used
        expect(dmc.getOutput()).toBe(127);

        dmc.writeDirectLoad(0x80); // Bit 7 ignored
        expect(dmc.getOutput()).toBe(0);
      });
    });

    describe('$4012 - Sample Address', () => {
      it('should calculate address as $C000 + value * 64', () => {
        const dmc = createDMCChannel();
        const addresses = [];
        const mockReader = jest.fn((addr) => {
          addresses.push(addr);
          return 0;
        });
        dmc.setMemoryReader(mockReader);
        dmc.writeSampleLength(0); // 1 byte

        // Value 0 = $C000
        dmc.writeSampleAddress(0);
        dmc.setEnabled(true);
        expect(addresses[0]).toBe(0xC000);

        // Value 1 = $C040
        addresses.length = 0;
        dmc.setEnabled(false);
        dmc.writeSampleAddress(1);
        dmc.setEnabled(true);
        expect(addresses[0]).toBe(0xC040);

        // Value 255 = $C000 + 255*64 = $FFC0
        addresses.length = 0;
        dmc.setEnabled(false);
        dmc.writeSampleAddress(255);
        dmc.setEnabled(true);
        expect(addresses[0]).toBe(0xFFC0);
      });
    });

    describe('$4013 - Sample Length', () => {
      it('should calculate length as value * 16 + 1', () => {
        const dmc = createDMCChannel();
        const mockReader = jest.fn().mockReturnValue(0);
        dmc.setMemoryReader(mockReader);
        dmc.writeSampleAddress(0);

        // Value 0 = 1 byte
        dmc.writeSampleLength(0);
        dmc.setEnabled(true);
        // After enabling, one byte should be fetched
        expect(mockReader).toHaveBeenCalledTimes(1);

        // Value 1 = 17 bytes
        mockReader.mockClear();
        dmc.setEnabled(false);
        dmc.writeSampleLength(1);
        dmc.setEnabled(true);
        // Clock through all 17 bytes (8 bits each = 136 output clocks)
        for (let i = 0; i < 100000; i++) {
          dmc.clockTimer();
        }
        // Should have fetched 17 bytes total
        expect(mockReader).toHaveBeenCalledTimes(17);
      });
    });
  });

  describe('sample playback', () => {
    it('should fetch first byte immediately when enabled (bug fix)', () => {
      const dmc = createDMCChannel();
      const mockReader = jest.fn().mockReturnValue(0xAA);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0); // 1 byte

      // Before enabling, no reads
      expect(mockReader).not.toHaveBeenCalled();

      // Enable - should immediately fetch first byte
      dmc.setEnabled(true);
      expect(mockReader).toHaveBeenCalledTimes(1);
      expect(mockReader).toHaveBeenCalledWith(0xC000);
    });

    it('should modulate output level based on sample bits', () => {
      const dmc = createDMCChannel();
      // 0xFF = all 1 bits, should add 2 for each bit
      const mockReader = jest.fn().mockReturnValue(0xFF);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0);
      dmc.writeDirectLoad(64); // Start at 64
      dmc.writeControl(0x0F); // Fastest rate (54 cycles)
      dmc.setEnabled(true);

      // Clock enough to process full byte (need ~500 clocks at fastest rate)
      // Rate 54, need 9 fires (load + 8 bits), so ~486 clocks minimum
      // Add extra to account for initial timer state
      for (let i = 0; i < 1000; i++) {
        dmc.clockTimer();
      }

      // All 1 bits should add 2 each: 64 + (8 * 2) = 80
      expect(dmc.getOutput()).toBe(80);
    });

    it('should subtract 2 for 0 bits', () => {
      const dmc = createDMCChannel();
      // 0x00 = all 0 bits, should subtract 2 for each bit
      const mockReader = jest.fn().mockReturnValue(0x00);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0);
      dmc.writeDirectLoad(64); // Start at 64
      dmc.writeControl(0x0F); // Fastest rate (54 cycles)
      dmc.setEnabled(true);

      // Clock enough to process full byte
      for (let i = 0; i < 1000; i++) {
        dmc.clockTimer();
      }

      // All 0 bits should subtract 2 each: 64 - (8 * 2) = 48
      expect(dmc.getOutput()).toBe(48);
    });

    it('should clamp output level at 127 (max)', () => {
      const dmc = createDMCChannel();
      const mockReader = jest.fn().mockReturnValue(0xFF);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0);
      dmc.writeDirectLoad(127); // Start at max
      dmc.writeControl(0x0F);
      dmc.setEnabled(true);

      for (let i = 0; i < 500; i++) {
        dmc.clockTimer();
      }

      // Should stay at 127, not overflow
      expect(dmc.getOutput()).toBe(127);
    });

    it('should clamp output level at 0 (min)', () => {
      const dmc = createDMCChannel();
      const mockReader = jest.fn().mockReturnValue(0x00);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0);
      dmc.writeDirectLoad(0); // Start at min
      dmc.writeControl(0x0F);
      dmc.setEnabled(true);

      for (let i = 0; i < 500; i++) {
        dmc.clockTimer();
      }

      // Should stay at 0, not underflow
      expect(dmc.getOutput()).toBe(0);
    });

    it('should increment sample address after each byte', () => {
      const dmc = createDMCChannel();
      const addresses = [];
      const mockReader = jest.fn((addr) => {
        addresses.push(addr);
        return 0x55;
      });
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0); // $C000
      dmc.writeSampleLength(1); // 17 bytes
      dmc.writeControl(0x0F); // Fastest rate
      dmc.setEnabled(true);

      // Clock through multiple bytes
      for (let i = 0; i < 10000; i++) {
        dmc.clockTimer();
      }

      // Addresses should be sequential
      expect(addresses[0]).toBe(0xC000);
      expect(addresses[1]).toBe(0xC001);
      expect(addresses[2]).toBe(0xC002);
    });

    it('should wrap address from $FFFF to $8000', () => {
      const dmc = createDMCChannel();
      const addresses = [];
      const mockReader = jest.fn((addr) => {
        addresses.push(addr);
        return 0x55;
      });
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(255); // $FFC0
      dmc.writeSampleLength(10); // 161 bytes - enough to wrap
      dmc.writeControl(0x0F);
      dmc.setEnabled(true);

      // Clock through all bytes
      for (let i = 0; i < 100000; i++) {
        dmc.clockTimer();
      }

      // Should have wrapped from $FFFF to $8000
      const wrapIndex = addresses.findIndex((addr, i) =>
        i > 0 && addresses[i-1] === 0xFFFF && addr === 0x8000
      );
      expect(wrapIndex).toBeGreaterThan(0);
    });
  });

  describe('enable/disable', () => {
    it('should clear bytes remaining when disabled', () => {
      const dmc = createDMCChannel();
      const mockReader = jest.fn().mockReturnValue(0);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(10); // 161 bytes
      dmc.setEnabled(true);

      expect(dmc.isActive()).toBe(true);

      dmc.setEnabled(false);
      expect(dmc.isActive()).toBe(false);
    });

    it('should restart sample when enabled and bytes remaining is 0', () => {
      const dmc = createDMCChannel();
      const mockReader = jest.fn().mockReturnValue(0);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0); // 1 byte
      dmc.writeControl(0x0F);

      dmc.setEnabled(true);
      expect(mockReader).toHaveBeenCalledTimes(1);

      // Clock until sample is done
      for (let i = 0; i < 500; i++) {
        dmc.clockTimer();
      }

      // Disable and re-enable
      dmc.setEnabled(false);
      mockReader.mockClear();
      dmc.setEnabled(true);

      // Should fetch again (restarted)
      expect(mockReader).toHaveBeenCalledTimes(1);
    });

    it('should continue outputting even when sample finished (no silence)', () => {
      const dmc = createDMCChannel();
      const mockReader = jest.fn().mockReturnValue(0xFF);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0); // 1 byte
      dmc.writeDirectLoad(64);
      dmc.writeControl(0x0F);
      dmc.setEnabled(true);

      // Clock until sample is definitely done
      for (let i = 0; i < 1000; i++) {
        dmc.clockTimer();
      }

      // Output should still be the last modulated value, not 0
      expect(dmc.getOutput()).toBeGreaterThan(0);
    });
  });

  describe('loop behavior', () => {
    it('should restart sample when loop flag is set and sample ends', () => {
      const dmc = createDMCChannel();
      const mockReader = jest.fn().mockReturnValue(0x55);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0); // 1 byte
      dmc.writeControl(0x4F); // Loop flag + fastest rate
      dmc.setEnabled(true);

      // Clock through multiple loops
      for (let i = 0; i < 5000; i++) {
        dmc.clockTimer();
      }

      // With looping, should have fetched many times
      expect(mockReader.mock.calls.length).toBeGreaterThan(5);
    });

    it('should stop reading when loop flag is not set', () => {
      const dmc = createDMCChannel();
      const mockReader = jest.fn().mockReturnValue(0x55);
      dmc.setMemoryReader(mockReader);
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0); // 1 byte
      dmc.writeControl(0x0F); // No loop flag, fastest rate
      dmc.setEnabled(true);

      // Clock through
      for (let i = 0; i < 5000; i++) {
        dmc.clockTimer();
      }

      // Without looping, should only fetch once
      expect(mockReader).toHaveBeenCalledTimes(1);
    });
  });

  describe('isActive', () => {
    it('should return true when bytes remaining > 0', () => {
      const dmc = createDMCChannel();
      dmc.setMemoryReader(jest.fn().mockReturnValue(0));
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(10);
      dmc.setEnabled(true);

      expect(dmc.isActive()).toBe(true);
    });

    it('should return false when bytes remaining = 0', () => {
      const dmc = createDMCChannel();
      dmc.setMemoryReader(jest.fn().mockReturnValue(0));
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0); // 1 byte
      dmc.writeControl(0x0F);
      dmc.setEnabled(true);

      // Clock until done
      for (let i = 0; i < 1000; i++) {
        dmc.clockTimer();
      }

      expect(dmc.isActive()).toBe(false);
    });
  });

  describe('memory reader', () => {
    it('should crash if memory reader is null', () => {
      const dmc = createDMCChannel();
      // Don't set memory reader
      dmc.writeSampleAddress(0);
      dmc.writeSampleLength(0);
      
      expect(() => dmc.setEnabled(true)).toThrow('DMC channel memory reader not set');
    });
  });
});
