const { createWatcher } = require('../../../systems/nes/apu/components/watcher');

describe('Watcher', () => {
  describe('clock', () => {
    it('should fire action after specified period', () => {
      let fired = 0;
      const watcher = createWatcher(3, () => { fired++; });

      watcher.clock(); // 1
      expect(fired).toBe(0);

      watcher.clock(); // 2
      expect(fired).toBe(0);

      watcher.clock(); // 3 - fires!
      expect(fired).toBe(1);
    });

    it('should fire repeatedly at the specified period', () => {
      let fired = 0;
      const watcher = createWatcher(2, () => { fired++; });

      watcher.clock(); // 1
      watcher.clock(); // 2 - fires (1)
      watcher.clock(); // 1
      watcher.clock(); // 2 - fires (2)
      watcher.clock(); // 1
      watcher.clock(); // 2 - fires (3)

      expect(fired).toBe(3);
    });

    it('should handle period of 1 (fires every clock)', () => {
      let fired = 0;
      const watcher = createWatcher(1, () => { fired++; });

      watcher.clock();
      watcher.clock();
      watcher.clock();
      watcher.clock();
      watcher.clock();

      expect(fired).toBe(5);
    });

    it('should handle fractional periods correctly', () => {
      let fired = 0;
      const watcher = createWatcher(2.5, () => { fired++; });

      // With period 2.5:
      // Clock 1: counter = 1
      // Clock 2: counter = 2
      // Clock 3: counter = 3 >= 2.5, fires! counter = 0.5
      // Clock 4: counter = 1.5
      // Clock 5: counter = 2.5 >= 2.5, fires! counter = 0

      watcher.clock(); // 1
      watcher.clock(); // 2
      expect(fired).toBe(0);

      watcher.clock(); // fires
      expect(fired).toBe(1);

      watcher.clock(); // 1.5
      expect(fired).toBe(1);

      watcher.clock(); // 2.5, fires
      expect(fired).toBe(2);
    });

    it('should preserve fractional remainder across fires', () => {
      let fired = 0;
      const watcher = createWatcher(2.5, () => { fired++; });

      // Fire 10 times
      for (let i = 0; i < 25; i++) {
        watcher.clock();
      }

      // 25 clocks / 2.5 period = 10 fires
      expect(fired).toBe(10);
    });
  });

  describe('reset', () => {
    it('should reset counter to 0', () => {
      let fired = 0;
      const watcher = createWatcher(3, () => { fired++; });

      watcher.clock(); // 1
      watcher.clock(); // 2
      watcher.reset(); // back to 0

      watcher.clock(); // 1
      watcher.clock(); // 2
      expect(fired).toBe(0); // still hasn't fired

      watcher.clock(); // 3 - fires
      expect(fired).toBe(1);
    });

    it('should clear fractional remainder', () => {
      let fired = 0;
      const watcher = createWatcher(2.5, () => { fired++; });

      watcher.clock(); // 1
      watcher.clock(); // 2
      watcher.clock(); // fires, counter = 0.5

      watcher.reset(); // counter = 0 (fractional cleared)

      // Now need exactly 2.5 clocks to fire again
      watcher.clock(); // 1
      watcher.clock(); // 2
      expect(fired).toBe(1);

      watcher.clock(); // 3 >= 2.5, fires
      expect(fired).toBe(2);
    });
  });

  describe('action context', () => {
    it('should call action with no arguments', () => {
      let args = null;
      const watcher = createWatcher(1, (...a) => { args = a; });

      watcher.clock();

      expect(args).toEqual([]);
    });

    it('should allow action to modify external state', () => {
      const state = { count: 0, values: [] };
      const watcher = createWatcher(2, () => {
        state.count++;
        state.values.push(state.count);
      });

      for (let i = 0; i < 10; i++) {
        watcher.clock();
      }

      expect(state.count).toBe(5);
      expect(state.values).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
