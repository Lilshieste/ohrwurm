const { mixPulse, mixTND, mix, mixScaled, mixLinear, mixScaledLinear } = require('../../systems/nes/apu/mixer');

describe('APU Mixer', () => {
  describe('mixPulse', () => {
    it('should return 0 when both pulse channels are 0', () => {
      expect(mixPulse(0, 0)).toBe(0);
    });

    it('should return non-zero when pulse channels have output', () => {
      expect(mixPulse(15, 0)).toBeGreaterThan(0);
      expect(mixPulse(0, 15)).toBeGreaterThan(0);
      expect(mixPulse(15, 15)).toBeGreaterThan(0);
    });

    it('should produce higher output with higher input', () => {
      const low = mixPulse(5, 0);
      const high = mixPulse(15, 0);
      expect(high).toBeGreaterThan(low);
    });

    it('should combine both pulse channels', () => {
      const single = mixPulse(15, 0);
      const both = mixPulse(15, 15);
      expect(both).toBeGreaterThan(single);
    });

    it('should produce output in range 0 to ~0.26', () => {
      const maxOutput = mixPulse(15, 15);
      expect(maxOutput).toBeGreaterThan(0);
      expect(maxOutput).toBeLessThan(0.3);
    });
  });

  describe('mixTND', () => {
    it('should return 0 when all channels are 0', () => {
      expect(mixTND(0, 0, 0)).toBe(0);
    });

    it('should return non-zero when triangle has output', () => {
      expect(mixTND(15, 0, 0)).toBeGreaterThan(0);
    });

    it('should return non-zero when noise has output', () => {
      expect(mixTND(0, 15, 0)).toBeGreaterThan(0);
    });

    it('should return non-zero when DMC has output', () => {
      expect(mixTND(0, 0, 127)).toBeGreaterThan(0);
    });

    it('should produce higher output with higher input', () => {
      const low = mixTND(5, 0, 0);
      const high = mixTND(15, 0, 0);
      expect(high).toBeGreaterThan(low);
    });

    it('should combine all TND channels', () => {
      const triangleOnly = mixTND(15, 0, 0);
      const triAndNoise = mixTND(15, 15, 0);
      expect(triAndNoise).toBeGreaterThan(triangleOnly);
    });

    it('should default DMC to 0', () => {
      expect(mixTND(15, 15)).toBe(mixTND(15, 15, 0));
    });

    it('should produce output in expected range', () => {
      const maxOutput = mixTND(15, 15, 127);
      expect(maxOutput).toBeGreaterThan(0);
      expect(maxOutput).toBeLessThan(1.0);
    });
  });

  describe('mix', () => {
    it('should return 0 when all channels are 0', () => {
      expect(mix(0, 0, 0, 0, 0)).toBe(0);
    });

    it('should combine pulse and TND outputs', () => {
      const pulseOnly = mix(15, 15, 0, 0, 0);
      const tndOnly = mix(0, 0, 15, 15, 0);
      const combined = mix(15, 15, 15, 15, 0);

      expect(combined).toBeCloseTo(pulseOnly + tndOnly, 5);
    });

    it('should produce output in expected range', () => {
      const maxOutput = mix(15, 15, 15, 15, 127);
      expect(maxOutput).toBeGreaterThan(0);
      expect(maxOutput).toBeLessThanOrEqual(1.0);
    });

    it('should default DMC to 0', () => {
      expect(mix(15, 15, 15, 15)).toBe(mix(15, 15, 15, 15, 0));
    });
  });

  describe('mixScaled', () => {
    it('should return 0 when all channels are 0', () => {
      expect(mixScaled(0, 0, 0, 0, 0)).toBe(0);
    });

    it('should scale output to reasonable range', () => {
      // Without DMC, output should be close to 15
      const withoutDMC = mixScaled(15, 15, 15, 15, 0);
      expect(withoutDMC).toBeGreaterThan(0);
      expect(withoutDMC).toBeLessThanOrEqual(15);

      // With DMC at max, can go slightly higher
      const withDMC = mixScaled(15, 15, 15, 15, 127);
      expect(withDMC).toBeGreaterThan(withoutDMC);
    });

    it('should produce reasonable output for typical values', () => {
      // Single pulse at full volume
      const singlePulse = mixScaled(15, 0, 0, 0);
      expect(singlePulse).toBeGreaterThan(0);
      expect(singlePulse).toBeLessThan(10);

      // Full mix
      const fullMix = mixScaled(15, 15, 15, 15);
      expect(fullMix).toBeGreaterThan(singlePulse);
    });

    it('should default DMC to 0', () => {
      expect(mixScaled(15, 15, 15, 15)).toBe(mixScaled(15, 15, 15, 15, 0));
    });
  });

  describe('mixLinear', () => {
    it('should return 0 when all channels are 0', () => {
      expect(mixLinear(0, 0, 0, 0, 0)).toBe(0);
    });

    it('should simply add all channel values', () => {
      expect(mixLinear(5, 5, 5, 5, 0)).toBe(20);
      expect(mixLinear(15, 15, 15, 15, 0)).toBe(60);
    });

    it('should include DMC when provided', () => {
      expect(mixLinear(0, 0, 0, 0, 10)).toBe(10);
    });
  });

  describe('mixScaledLinear', () => {
    it('should return 0 when all channels are 0', () => {
      expect(mixScaledLinear(0, 0, 0, 0, 0)).toBe(0);
    });

    it('should clamp output to 15', () => {
      expect(mixScaledLinear(15, 15, 15, 15, 0)).toBe(15);
    });

    it('should not clamp when sum is under 15', () => {
      expect(mixScaledLinear(5, 5, 0, 0, 0)).toBe(10);
    });
  });

  describe('non-linear behavior', () => {
    it('should exhibit diminishing returns (non-linear)', () => {
      // Adding more to an already loud signal should have less effect
      const base = mixPulse(10, 0);
      const added5 = mixPulse(15, 0);
      const diff1 = added5 - base; // Adding 5 to 10

      const base2 = mixPulse(0, 0);
      const added5_2 = mixPulse(5, 0);
      const diff2 = added5_2 - base2; // Adding 5 to 0

      // Adding 5 when starting from 0 should have more impact
      // than adding 5 when starting from 10
      expect(diff2).toBeGreaterThan(diff1);
    });

    it('should prevent harsh clipping compared to linear mixing', () => {
      // With linear mixing, 15+15+15+15 = 60, clamped to 15
      // With non-linear mixing, we get natural headroom
      const mixed = mix(15, 15, 15, 15);

      // Should be well under 1.0 even at max volume
      expect(mixed).toBeLessThan(1.0);
    });
  });
});
