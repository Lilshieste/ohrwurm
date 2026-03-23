const { createAPU } = require('../../cores/apu/apu');

describe('APU', () => {
  describe('register writes', () => {
    it('should dispatch $4000-$4003 to Pulse 1', () => {
      const apu = createAPU();

      // Enable pulse 1
      apu.writeRegister(0x4015, 0x01);

      // Write typical pulse setup (period >= 8 to avoid silence)
      apu.writeRegister(0x4000, 0x9F); // 50% duty, constant volume 15
      apu.writeRegister(0x4002, 0x08); // timer low = 8
      apu.writeRegister(0x4003, 0x00); // timer high = 0

      // Clock enough to advance duty position and generate samples
      apu.clock(100);

      // Should produce non-zero samples
      const samples = apu.getSamples(10);
      const hasNonZero = samples.some(s => s > 0);
      expect(hasNonZero).toBe(true);
    });

    it('should handle $4015 status register writes (channel enable)', () => {
      const apu = createAPU();

      // Enable pulse 1
      apu.writeRegister(0x4015, 0x01);

      // Set up pulse 1 (period >= 8 to avoid silence)
      apu.writeRegister(0x4000, 0x9F); // constant volume
      apu.writeRegister(0x4002, 0x08);
      apu.writeRegister(0x4003, 0x00);
      apu.clock(100);

      // Verify we have sound initially
      const enabledSamples = apu.getSamples(10);
      expect(enabledSamples.some(s => s > 0)).toBe(true);

      // Disable pulse 1 and generate more samples
      apu.writeRegister(0x4015, 0x00);
      apu.clock(100);
      const disabledSamples = apu.getSamples(10);
      expect(disabledSamples.every(s => s === 0)).toBe(true);

      // Re-enable pulse 1
      apu.writeRegister(0x4015, 0x01);
      apu.clock(100);
      const reenabledSamples = apu.getSamples(10);
      expect(reenabledSamples.some(s => s > 0)).toBe(true);
    });
  });

  describe('clocking', () => {
    it('should clock pulse channel timer and produce oscillating output', () => {
      const apu = createAPU();

      // Enable pulse 1
      apu.writeRegister(0x4015, 0x01);

      // Set up pulse with period 8
      apu.writeRegister(0x4000, 0x9F); // 50% duty, constant volume 15
      apu.writeRegister(0x4002, 0x08); // timer low = 8
      apu.writeRegister(0x4003, 0x00); // timer high = 0

      // Clock enough to see full duty cycle
      apu.clock(200);
      const samples = apu.getSamples(50);

      // Should see both high and low values as duty position advances
      const hasHigh = samples.some(s => s > 0);
      const hasLow = samples.some(s => s === 0);
      expect(hasHigh).toBe(true);
      expect(hasLow).toBe(true);
    });

    it('should accept multiple cycles at once', () => {
      const apu = createAPU();

      apu.writeRegister(0x4015, 0x01);
      apu.writeRegister(0x4000, 0x9F); // constant volume
      apu.writeRegister(0x4002, 0x08);
      apu.writeRegister(0x4003, 0x00);

      // Should not throw when clocking multiple cycles
      expect(() => apu.clock(100)).not.toThrow();
    });
  });

  describe('sample output', () => {
    it('should return raw NES samples (0-15 range)', () => {
      const apu = createAPU();

      // Enable pulse 1
      apu.writeRegister(0x4015, 0x01);

      apu.writeRegister(0x4000, 0x9F); // 50% duty, constant volume 15
      apu.writeRegister(0x4002, 0x08); // period >= 8
      apu.writeRegister(0x4003, 0x00);
      apu.clock(100);

      const samples = apu.getSamples(20);
      for (const sample of samples) {
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThanOrEqual(15);
      }
    });

    it('should return 0 when no channels are enabled', () => {
      const apu = createAPU();

      // Don't enable any channels, just clock
      apu.clock(100);
      const samples = apu.getSamples(10);
      expect(samples.every(s => s === 0)).toBe(true);
    });
  });
});
