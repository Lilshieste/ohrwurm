// NES APU Mixer using non-linear mixing formula
// From: https://www.nesdev.org/wiki/APU_Mixer
//
// The NES uses a resistor DAC network that creates non-linear mixing.
// These constants are derived from the resistor values in the hardware.

// Pulse mixer constants
const PULSE_NUMERATOR = 95.88;
const PULSE_DENOMINATOR_SCALE = 8128;
const PULSE_DENOMINATOR_OFFSET = 100;

// TND (Triangle/Noise/DMC) mixer constants
const TND_NUMERATOR = 159.79;
const TND_DENOMINATOR_OFFSET = 100;
const TRIANGLE_DIVISOR = 8227;
const NOISE_DIVISOR = 12241;
const DMC_DIVISOR = 22638;

// Output scaling
const MAX_OUTPUT_WITHOUT_DMC = 0.79; // Approximate max when all channels at full volume (no DMC)
const SCALED_OUTPUT_MAX = 15;

// Mix pulse channels (0.0 to ~0.26)
const mixPulse = (pulse1, pulse2) => {
  const sum = pulse1 + pulse2;
  if (sum === 0) return 0;
  return PULSE_NUMERATOR / ((PULSE_DENOMINATOR_SCALE / sum) + PULSE_DENOMINATOR_OFFSET);
};

// Mix triangle, noise, and DMC channels (0.0 to ~0.74)
const mixTND = (triangle, noise, dmc = 0) => {
  const sum = triangle / TRIANGLE_DIVISOR + noise / NOISE_DIVISOR + dmc / DMC_DIVISOR;
  if (sum === 0) return 0;
  return TND_NUMERATOR / ((1 / sum) + TND_DENOMINATOR_OFFSET);
};

// Combined mix - returns 0.0 to ~1.0
const mix = (pulse1, pulse2, triangle, noise, dmc = 0) => {
  return mixPulse(pulse1, pulse2) + mixTND(triangle, noise, dmc);
};

// Scale to 0-15 range (for compatibility with existing system)
const mixScaled = (pulse1, pulse2, triangle, noise, dmc = 0) => {
  return mix(pulse1, pulse2, triangle, noise, dmc) * SCALED_OUTPUT_MAX / MAX_OUTPUT_WITHOUT_DMC;
};

// Simple linear additive mixer (for comparison)
// This was the original implementation - causes clipping when multiple channels are loud
const mixLinear = (pulse1, pulse2, triangle, noise, dmc = 0) => {
  return pulse1 + pulse2 + triangle + noise + dmc;
};

// Linear mixer scaled to 0-15 range with clamping
const mixScaledLinear = (pulse1, pulse2, triangle, noise, dmc = 0) => {
  return Math.min(SCALED_OUTPUT_MAX, mixLinear(pulse1, pulse2, triangle, noise, dmc));
};

module.exports = {
  mixPulse,
  mixTND,
  mix,
  mixScaled,
  mixLinear,
  mixScaledLinear,
};
