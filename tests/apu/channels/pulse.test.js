
const { createPulseChannel } = require('../../../apu/channels/pulse');

describe('Pulse Channel', () => {
  describe('duty cycle', () => {
    // Duty cycle sequences (8 steps each):
    // 0: 12.5% - [0,1,0,0,0,0,0,0]
    // 1: 25%   - [0,1,1,0,0,0,0,0]
    // 2: 50%   - [0,1,1,1,1,0,0,0]
    // 3: 75%   - [1,0,0,1,1,1,1,1]

    const getOutputsForPulseChannel = (pulse, steps) => {
      const period = pulse.getTimerPeriod();
      const clocksPerStep = period + 1; // Timer fires after counting down from period to 0
      return Array.from({ length: steps }, () => {
        const output = pulse.getOutput() > 0 ? 1 : 0;
        // Clock enough times to advance duty position by 1
        for (let i = 0; i < clocksPerStep; i++) {
          pulse.clockTimer();
        }
        return output;
      });
    }

    describe('when duty sequence (mode) is 0', () => {
      it('should produce 12.5% duty cycle', () => {
        const pulse = createPulseChannel(1);
        pulse.writeControl(0x0F); // duty = 0, volume = 15
        pulse.writeTimerLow(0x08); // period >= 8 to avoid silence
        pulse.writeTimerHigh(0x00);

        const outputs = getOutputsForPulseChannel(pulse, 8);

        expect(outputs).toEqual([0, 1, 0, 0, 0, 0, 0, 0]);
      });
    });

    describe('when duty sequence (mode) is 1', () => {
      it('should produce 25% duty cycle', () => {
        const pulse = createPulseChannel(1);
        pulse.writeControl(0x4F); // duty = 1, volume = 15
        pulse.writeTimerLow(0x08); // period >= 8 to avoid silence
        pulse.writeTimerHigh(0x00);

        const outputs = getOutputsForPulseChannel(pulse, 8);

        expect(outputs).toEqual([0, 1, 1, 0, 0, 0, 0, 0]);
      });
    });

    describe('when duty sequence (mode) is 2', () => {
      it('should produce 50% duty cycle', () => {
        const pulse = createPulseChannel(1);
        pulse.writeControl(0x8F); // duty = 2, volume = 15
        pulse.writeTimerLow(0x08); // period >= 8 to avoid silence
        pulse.writeTimerHigh(0x00);

        const outputs = getOutputsForPulseChannel(pulse, 8);

        expect(outputs).toEqual([0, 1, 1, 1, 1, 0, 0, 0]);
      });
    });

    describe('when duty sequence (mode) is 3', () => {
      it('should produce 75% duty cycle', () => {
        const pulse = createPulseChannel(1);
        pulse.writeControl(0xCF); // duty = 3, volume = 15
        pulse.writeTimerLow(0x08); // period >= 8 to avoid silence
        pulse.writeTimerHigh(0x00);

        const outputs = getOutputsForPulseChannel(pulse, 8);

        expect(outputs).toEqual([1, 0, 0, 1, 1, 1, 1, 1]);
      });
    });    
  });

  describe('timer', () => {
    it('should use timer period to control frequency', () => {
      const pulse = createPulseChannel(1);
      pulse.writeControl(0x8F); // 50% duty, volume 15
      pulse.writeTimerLow(0x02); // period low = 2
      pulse.writeTimerHigh(0x00); // period high = 0, so period = 2

      // With period 2, timer fires every 3 clocks (counts 2, 1, 0)
      // Duty position advances each time timer fires
      let timerFires = 0;
      for (let i = 0; i < 9; i++) {
        if (pulse.clockTimer()) {
          timerFires++;
        }
      }

      // Should fire 3 times in 9 clocks with period 2
      expect(timerFires).toBe(3);
    });

    it('should set 11-bit timer period from registers', () => {
      const pulse = createPulseChannel(1);
      pulse.writeTimerLow(0xFF);  // low 8 bits = 255
      pulse.writeTimerHigh(0x07); // high 3 bits = 7

      // Period should be (7 << 8) | 255 = 2047
      expect(pulse.getTimerPeriod()).toBe(2047);
    });
  });

  describe('volume', () => {
    it('should output constant volume from control register', () => {
      const pulse = createPulseChannel(1);
      pulse.writeControl(0x3F); // duty mode 0, constant volume = 15
      pulse.writeTimerLow(0x08); // period = 8
      pulse.writeTimerHigh(0x00);

      // Advance to duty position 1 (high for mode 0)
      // Need to clock period+1 times to advance duty position
      for (let i = 0; i < 9; i++) {
        pulse.clockTimer();
      }

      expect(pulse.getOutput()).toBe(15);
    });

    it('should output 0 when at low position in duty cycle', () => {
      const pulse = createPulseChannel(1);
      pulse.writeControl(0x3F); // constant volume = 15
      pulse.writeTimerLow(0x08); // period >= 8 to avoid silence
      pulse.writeTimerHigh(0x00);

      // Position 0 is low for 50% duty (mode 2 = 0x80)
      // But we set mode 0 (0x00 in upper bits), position 0 is also low
      expect(pulse.getOutput()).toBe(0);
    });
  });

  describe('enable', () => {
    it('should output 0 when channel is disabled', () => {
      const pulse = createPulseChannel(1);
      pulse.writeControl(0xBF); // 50% duty, volume 15
      pulse.writeTimerLow(0x08); // period >= 8 to avoid silence
      pulse.writeTimerHigh(0x00);
      pulse.clockTimer(); // move to high position

      pulse.setEnabled(false);

      expect(pulse.getOutput()).toBe(0);
    });

    it('should output normally when channel is enabled', () => {
      const pulse = createPulseChannel(1);
      pulse.writeControl(0xBF); // 50% duty (mode 2), constant volume 15
      pulse.writeTimerLow(0x08); // period = 8
      pulse.writeTimerHigh(0x00);

      // Advance to duty position 1 (high for mode 2)
      for (let i = 0; i < 9; i++) {
        pulse.clockTimer();
      }

      pulse.setEnabled(true);

      expect(pulse.getOutput()).toBe(15);
    });
  });
});
