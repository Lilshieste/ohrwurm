const { createTriangleChannel } = require('../../../systems/nes/apu/channels/triangle');

describe('Triangle Channel', () => {
  describe('waveform', () => {
    it('should produce 32-step triangle waveform (15→0→15)', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0xFF); // max linear counter, control flag set
      triangle.writeTimerLow(0x01); // short period
      triangle.writeTimerHigh(0xF8); // load length counter + set reload flag
      triangle.clockLinearCounter(); // load linear counter

      // Collect 32 samples by clocking timer enough times
      const period = 1; // timer period
      const outputs = [];

      for (let step = 0; step < 32; step++) {
        outputs.push(triangle.getOutput());
        // Clock enough to advance sequencer position
        for (let i = 0; i <= period; i++) {
          triangle.clockTimer();
        }
      }

      // First half should descend 15→0
      expect(outputs[0]).toBe(15);
      expect(outputs[15]).toBe(0);

      // Second half should ascend 0→15
      expect(outputs[16]).toBe(0);
      expect(outputs[31]).toBe(15);
    });
  });

  describe('timer', () => {
    it('should set 11-bit timer period from registers', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0xFF);
      triangle.writeTimerLow(0xFF); // low 8 bits = 255
      triangle.writeTimerHigh(0xF7); // high 3 bits = 7, load length counter
      triangle.clockLinearCounter(); // load linear counter

      // Period should be (7 << 8) | 255 = 2047
      // With period 2047, it takes 2048 clocks to advance sequencer
      // So after 100 clocks, output should still be at position 0
      for (let i = 0; i < 100; i++) {
        triangle.clockTimer();
      }
      // Position 0 = 15
      expect(triangle.getOutput()).toBe(15);
    });

    it('should use lower timer period for higher frequency', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0xFF);
      triangle.writeTimerLow(0x00); // period low = 0
      triangle.writeTimerHigh(0xF8); // period high = 0, load length counter
      triangle.clockLinearCounter(); // load linear counter

      // With period 0, every clock advances sequencer
      triangle.clockTimer(); // fires, advances from 0 to 1
      expect(triangle.getOutput()).toBe(14); // position 1

      triangle.clockTimer(); // fires, advances to 2
      expect(triangle.getOutput()).toBe(13); // position 2
    });
  });

  describe('linear counter', () => {
    it('should silence channel when linear counter reaches 0', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0x02); // reload value = 2, control flag clear
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0xF8); // sets reload flag

      // Clock linear counter to load it
      triangle.clockLinearCounter(); // counter = 2, clears reload flag
      expect(triangle.getOutput()).toBe(15); // should have output

      // Clock linear counter until it reaches 0
      triangle.clockLinearCounter(); // counter = 1
      expect(triangle.getOutput()).toBe(15);

      triangle.clockLinearCounter(); // counter = 0
      expect(triangle.getOutput()).toBe(0); // silenced
    });

    it('should reload when reload flag is set', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0x05); // reload value = 5
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0xF8); // sets reload flag

      // Clock to load counter
      triangle.clockLinearCounter(); // counter = 5

      // Write to $400B again to set reload flag
      triangle.writeTimerHigh(0xF8);

      // Clock - should reload to 5 again
      triangle.clockLinearCounter();
      expect(triangle.getOutput()).toBe(15); // still active
    });

    it('should keep reload flag set when control flag is set', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0x82); // reload value = 2, control flag SET
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0xF8); // sets reload flag

      // With control flag set, reload flag stays set
      // So counter reloads every clock
      for (let i = 0; i < 10; i++) {
        triangle.clockLinearCounter();
        expect(triangle.getOutput()).toBe(15); // always active
      }
    });
  });

  describe('length counter', () => {
    it('should silence channel when length counter reaches 0', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0x80); // control flag set (keeps linear counter active)
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0x18); // length index 3 = 2, but control flag halts length

      // Actually, we need control flag CLEAR to allow length counter to decrement
      // Let's use a different approach
      const tri2 = createTriangleChannel();
      tri2.setEnabled(true);
      tri2.writeLinearCounter(0x7F); // max reload, control flag CLEAR
      tri2.writeTimerLow(0x00);
      tri2.writeTimerHigh(0x18); // length index 3 = 2

      // Clock linear counter to activate
      tri2.clockLinearCounter();

      // Verify it has output initially
      expect(tri2.getOutput()).toBe(15);

      // Clock length counter until it reaches 0
      for (let i = 0; i < 5; i++) {
        tri2.clockLengthCounter();
      }

      expect(tri2.getOutput()).toBe(0); // silenced
    });

    it('should not decrement when halt flag (control flag) is set', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0x82); // control flag = halt flag
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0x18); // length index 3 = 2

      // Clock linear counter to activate
      triangle.clockLinearCounter();

      // Clock length counter many times
      for (let i = 0; i < 10; i++) {
        triangle.clockLengthCounter();
      }

      // Should still have output because halt flag prevents decrement
      expect(triangle.getOutput()).toBe(15);
    });
  });

  describe('enable', () => {
    it('should output 0 when disabled', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(false);
      triangle.writeLinearCounter(0xFF);
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0xF8);

      triangle.clockLinearCounter();
      expect(triangle.getOutput()).toBe(0);
    });

    it('should clear length counter when disabled', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0xFF);
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0xF8);

      triangle.clockLinearCounter();
      expect(triangle.getOutput()).toBe(15);

      triangle.setEnabled(false);
      triangle.setEnabled(true);

      // Length counter was cleared, so output should be 0 until reloaded
      expect(triangle.getOutput()).toBe(0);
    });

    it('should not load length counter when channel is disabled', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(false);
      triangle.writeLinearCounter(0xFF);
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0xF8); // This should NOT load length counter

      triangle.setEnabled(true);
      triangle.clockLinearCounter();

      // Length counter should still be 0
      expect(triangle.getOutput()).toBe(0);
    });
  });

  describe('sequencer gating', () => {
    it('should not advance sequencer when linear counter is 0', () => {
      const triangle = createTriangleChannel();
      triangle.setEnabled(true);
      triangle.writeLinearCounter(0x01); // reload value = 1, control flag clear
      triangle.writeTimerLow(0x00);
      triangle.writeTimerHigh(0xF8);

      // Load linear counter
      triangle.clockLinearCounter(); // counter = 1
      const initialOutput = triangle.getOutput();

      // Expire linear counter
      triangle.clockLinearCounter(); // counter = 0

      // Clock timer many times - sequencer should NOT advance
      for (let i = 0; i < 10; i++) {
        triangle.clockTimer();
      }

      // Re-enable linear counter
      triangle.writeTimerHigh(0xF8); // set reload flag
      triangle.clockLinearCounter(); // reload

      // Output should still be at same position
      expect(triangle.getOutput()).toBe(initialOutput);
    });
  });
});
