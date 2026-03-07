const { createLinearCounter } = require('../../../apu/components/linearCounter');

describe('Linear Counter', () => {
  describe('writeControl', () => {
    it('should set reload value from lower 7 bits', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x7F); // reload value = 127
      lc.setReloadFlag();
      lc.clock(); // loads counter with reload value

      expect(lc.isActive()).toBe(true);

      // Clock 127 times to reach 0
      for (let i = 0; i < 127; i++) {
        lc.clock();
      }
      expect(lc.isActive()).toBe(false);
    });

    it('should set control flag from bit 7', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x82); // control flag set, reload = 2

      expect(lc.getControlFlag()).toBe(true);

      lc.writeControl(0x02); // control flag clear
      expect(lc.getControlFlag()).toBe(false);
    });
  });

  describe('reload behavior', () => {
    it('should load counter with reload value when reload flag is set', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x05); // reload value = 5, control flag clear
      lc.setReloadFlag();

      lc.clock(); // should load counter = 5
      expect(lc.isActive()).toBe(true);

      // Verify it counts down from 5
      lc.clock(); // 4
      lc.clock(); // 3
      lc.clock(); // 2
      lc.clock(); // 1
      expect(lc.isActive()).toBe(true);

      lc.clock(); // 0
      expect(lc.isActive()).toBe(false);
    });

    it('should clear reload flag after clocking when control flag is clear', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x05); // reload value = 5, control flag clear
      lc.setReloadFlag();

      lc.clock(); // loads counter, clears reload flag

      // Set reload flag again
      lc.setReloadFlag();
      lc.clock(); // should reload to 5 again

      // But after this, reload flag is cleared, so next clock decrements
      lc.clock(); // should decrement to 4, not reload

      // Counter should now be 4, not 5
      // Clock 4 more times to reach 0
      lc.clock(); // 3
      lc.clock(); // 2
      lc.clock(); // 1
      lc.clock(); // 0
      expect(lc.isActive()).toBe(false);
    });

    it('should keep reload flag set when control flag is set', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x85); // reload value = 5, control flag SET
      lc.setReloadFlag();

      // With control flag set, reload flag stays set
      // So counter reloads every clock and never decrements
      for (let i = 0; i < 20; i++) {
        lc.clock();
        expect(lc.isActive()).toBe(true); // always active
      }
    });
  });

  describe('clock', () => {
    it('should decrement counter when reload flag is not set', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x03); // reload value = 3, control flag clear
      lc.setReloadFlag();

      lc.clock(); // load counter = 3, clear reload flag
      expect(lc.isActive()).toBe(true);

      lc.clock(); // decrement to 2
      expect(lc.isActive()).toBe(true);

      lc.clock(); // decrement to 1
      expect(lc.isActive()).toBe(true);

      lc.clock(); // decrement to 0
      expect(lc.isActive()).toBe(false);
    });

    it('should not decrement below 0', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x01); // reload value = 1
      lc.setReloadFlag();

      lc.clock(); // load counter = 1, clear reload flag
      lc.clock(); // decrement to 0
      lc.clock(); // should stay at 0

      expect(lc.isActive()).toBe(false);
    });

    it('should reload instead of decrement when reload flag is set', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x05); // reload value = 5, control flag clear
      lc.setReloadFlag();

      lc.clock(); // load counter = 5

      // Set reload flag again before counter expires
      lc.setReloadFlag();

      lc.clock(); // should reload to 5 again
      lc.clock(); // 4
      lc.clock(); // 3
      lc.clock(); // 2
      lc.clock(); // 1
      expect(lc.isActive()).toBe(true);

      lc.clock(); // 0
      expect(lc.isActive()).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return false initially (counter is 0)', () => {
      const lc = createLinearCounter();
      expect(lc.isActive()).toBe(false);
    });

    it('should return true when counter > 0', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x10);
      lc.setReloadFlag();
      lc.clock();

      expect(lc.isActive()).toBe(true);
    });
  });

  describe('isSilenced', () => {
    it('should return true when counter is not active', () => {
      const lc = createLinearCounter();
      expect(lc.isActive()).toBe(false);
      expect(lc.isSilenced()).toBe(true);
    });

    it('should return false when counter is active', () => {
      const lc = createLinearCounter();
      lc.writeControl(0x10);
      lc.setReloadFlag();
      lc.clock();

      expect(lc.isActive()).toBe(true);
      expect(lc.isSilenced()).toBe(false);
    });
  });

  describe('getControlFlag', () => {
    it('should return control flag state', () => {
      const lc = createLinearCounter();

      lc.writeControl(0x00);
      expect(lc.getControlFlag()).toBe(false);

      lc.writeControl(0x80);
      expect(lc.getControlFlag()).toBe(true);

      lc.writeControl(0x7F);
      expect(lc.getControlFlag()).toBe(false);

      lc.writeControl(0xFF);
      expect(lc.getControlFlag()).toBe(true);
    });
  });
});
