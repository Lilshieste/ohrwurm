const { createEnvelope } = require('../../../systems/nes/apu/envelope');

describe('Envelope', () => {
  describe('initial state', () => {
    it('should output 0 before any restart', () => {
      const env = createEnvelope();
      expect(env.getOutput()).toBe(0);
    });

    it('should output 0 after clocking without restart', () => {
      const env = createEnvelope();
      env.clock();
      env.clock();
      expect(env.getOutput()).toBe(0);
    });
  });

  describe('restart behavior', () => {
    it('should output 15 after restart and clock', () => {
      const env = createEnvelope();
      env.restart();
      env.clock();
      expect(env.getOutput()).toBe(15);
    });

    it('should reset to 15 on multiple restarts', () => {
      const env = createEnvelope();
      env.writePeriod(0); // fastest decay
      env.restart();
      env.clock(); // output = 15

      // Decay a few times
      env.clock(); // 14
      env.clock(); // 13
      expect(env.getOutput()).toBe(13);

      // Restart should reset to 15
      env.restart();
      env.clock();
      expect(env.getOutput()).toBe(15);
    });
  });

  describe('decay with period = 0 (fastest)', () => {
    it('should decrement output every clock', () => {
      const env = createEnvelope();
      env.writePeriod(0);
      env.restart();
      env.clock(); // startFlag cleared, decayLevel = 15, divider = 0

      // Each clock: divider reaches 0, reload to 0, decrement decayLevel
      expect(env.getOutput()).toBe(15);

      env.clock(); // divider 0->0, decay 15->14
      expect(env.getOutput()).toBe(14);

      env.clock(); // 13
      expect(env.getOutput()).toBe(13);

      env.clock(); // 12
      expect(env.getOutput()).toBe(12);
    });

    it('should reach 0 after 16 clocks (including restart clock)', () => {
      const env = createEnvelope();
      env.writePeriod(0);
      env.restart();

      // 1 clock for restart, 15 clocks for decay
      for (let i = 0; i < 16; i++) {
        env.clock();
      }
      expect(env.getOutput()).toBe(0);
    });
  });

  describe('decay with period > 0', () => {
    it('should wait (period + 1) clocks between decrements with period = 1', () => {
      const env = createEnvelope();
      env.writePeriod(1);
      env.restart();
      env.clock(); // startFlag cleared, decayLevel = 15, divider = 1

      expect(env.getOutput()).toBe(15);

      env.clock(); // divider 1->0
      expect(env.getOutput()).toBe(15);

      env.clock(); // divider 0->1, decay 15->14
      expect(env.getOutput()).toBe(14);

      env.clock(); // divider 1->0
      expect(env.getOutput()).toBe(14);

      env.clock(); // divider 0->1, decay 14->13
      expect(env.getOutput()).toBe(13);
    });

    it('should wait (period + 1) clocks between decrements with period = 15', () => {
      const env = createEnvelope();
      env.writePeriod(15);
      env.restart();
      env.clock(); // startFlag cleared, decayLevel = 15, divider = 15

      expect(env.getOutput()).toBe(15);

      // Clock 15 times - divider counts down but no decay yet
      for (let i = 0; i < 15; i++) {
        env.clock();
        expect(env.getOutput()).toBe(15);
      }

      // 16th clock triggers first decay
      env.clock();
      expect(env.getOutput()).toBe(14);
    });
  });

  describe('loop flag behavior', () => {
    it('should stay at 0 without loop flag', () => {
      const env = createEnvelope();
      env.writePeriod(0);
      env.setLoopFlag(false);
      env.restart();

      // Decay all the way to 0
      for (let i = 0; i < 20; i++) {
        env.clock();
      }
      expect(env.getOutput()).toBe(0);

      // Should stay at 0
      env.clock();
      expect(env.getOutput()).toBe(0);
      env.clock();
      expect(env.getOutput()).toBe(0);
    });

    it('should wrap to 15 with loop flag', () => {
      const env = createEnvelope();
      env.writePeriod(0);
      env.setLoopFlag(true);
      env.restart();

      // Decay all the way to 0
      for (let i = 0; i < 16; i++) {
        env.clock();
      }
      expect(env.getOutput()).toBe(0);

      // Next clock should wrap to 15
      env.clock();
      expect(env.getOutput()).toBe(15);
    });

    it('should continuously loop with loop flag', () => {
      const env = createEnvelope();
      env.writePeriod(0);
      env.setLoopFlag(true);
      env.restart();

      // First clock: restart takes effect, decayLevel = 15
      env.clock();
      expect(env.getOutput()).toBe(15);

      // Run through multiple full decay cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        // Decay from 15 down to 0 (15 clocks)
        for (let i = 14; i >= 0; i--) {
          env.clock();
          expect(env.getOutput()).toBe(i);
        }

        // Next clock wraps to 15
        env.clock();
        expect(env.getOutput()).toBe(15);
      }
    });
  });

  describe('writePeriod', () => {
    it('should mask to lower 4 bits', () => {
      const env = createEnvelope();
      env.writePeriod(0xFF); // should become 0x0F
      env.restart();
      env.clock();

      // With period 15, need 16 clocks to first decay
      for (let i = 0; i < 15; i++) {
        env.clock();
        expect(env.getOutput()).toBe(15);
      }
      env.clock();
      expect(env.getOutput()).toBe(14);
    });

    it('should affect divider reload value', () => {
      const env = createEnvelope();
      env.writePeriod(2);
      env.restart();
      env.clock(); // divider = 2

      // 3 clocks to first decay (2, 1, 0 -> reload and decay)
      env.clock(); // 2->1
      expect(env.getOutput()).toBe(15);
      env.clock(); // 1->0
      expect(env.getOutput()).toBe(15);
      env.clock(); // 0->2, decay
      expect(env.getOutput()).toBe(14);
    });
  });

  describe('setLoopFlag', () => {
    it('should be able to toggle loop flag dynamically', () => {
      const env = createEnvelope();
      env.writePeriod(0);
      env.setLoopFlag(false);
      env.restart();

      // Decay to 0
      for (let i = 0; i < 16; i++) {
        env.clock();
      }
      expect(env.getOutput()).toBe(0);

      // Clock without wrap
      env.clock();
      expect(env.getOutput()).toBe(0);

      // Enable loop and restart
      env.setLoopFlag(true);
      env.restart();

      // Decay to 0 again
      for (let i = 0; i < 16; i++) {
        env.clock();
      }
      expect(env.getOutput()).toBe(0);

      // Now should wrap
      env.clock();
      expect(env.getOutput()).toBe(15);
    });
  });
});
