const { createAPU } = require('../../apu/apu');

describe('APU', () => {
  describe('register writes', () => {
    it('should dispatch $4000-$4003 to Pulse 1', () => {
      const apu = createAPU();

      // Write typical pulse setup
      apu.writeRegister(0x4000, 0x8F); // 50% duty, volume 15
      apu.writeRegister(0x4002, 0x00); // timer low
      apu.writeRegister(0x4003, 0x00); // timer high

      // Clock once to advance duty position to a "high" spot
      apu.clock(1);

      // Should produce non-zero output
      expect(apu.getSample()).toBeGreaterThan(0);
    });

    it('should handle $4015 status register writes (channel enable)', () => {
      const apu = createAPU();

      // Set up pulse 1
      apu.writeRegister(0x4000, 0x8F);
      apu.writeRegister(0x4002, 0x00);
      apu.writeRegister(0x4003, 0x00);
      apu.clock(1);

      // Disable pulse 1
      apu.writeRegister(0x4015, 0x00);
      expect(apu.getSample()).toBe(0);

      // Re-enable pulse 1
      apu.writeRegister(0x4015, 0x01);
      expect(apu.getSample()).toBeGreaterThan(0);
    });
  });

  describe('clocking', () => {
    it('should clock pulse channel timer', () => {
      const apu = createAPU();

      // Set up pulse with period 2 (fires every 3 clocks)
      apu.writeRegister(0x4000, 0x8F); // 50% duty, volume 15
      apu.writeRegister(0x4002, 0x02); // timer low = 2
      apu.writeRegister(0x4003, 0x00); // timer high = 0

      const samples = [];
      // Clock 24 times to see duty cycle progression
      for (let i = 0; i < 24; i++) {
        apu.clock(1);
        samples.push(apu.getSample());
      }

      // Should see pattern change as duty position advances
      const hasHigh = samples.some(s => s > 0);
      const hasLow = samples.some(s => s === 0);
      expect(hasHigh).toBe(true);
      expect(hasLow).toBe(true);
    });

    it('should accept multiple cycles at once', () => {
      const apu = createAPU();

      apu.writeRegister(0x4000, 0x8F);
      apu.writeRegister(0x4002, 0x00);
      apu.writeRegister(0x4003, 0x00);

      // Should not throw when clocking multiple cycles
      expect(() => apu.clock(100)).not.toThrow();
    });
  });

  describe('sample output', () => {
    it('should return normalized sample (0-1 range)', () => {
      const apu = createAPU();

      apu.writeRegister(0x4000, 0x8F); // volume 15
      apu.writeRegister(0x4002, 0x00);
      apu.writeRegister(0x4003, 0x00);
      apu.clock(1);

      const sample = apu.getSample();
      expect(sample).toBeGreaterThanOrEqual(0);
      expect(sample).toBeLessThanOrEqual(1);
    });

    it('should return 0 when no channels are active', () => {
      const apu = createAPU();

      // Don't set up any channels
      expect(apu.getSample()).toBe(0);
    });
  });
});
