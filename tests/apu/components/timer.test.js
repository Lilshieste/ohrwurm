const { createTimer } = require('../../../cores/apu/components/timer');

describe('When clock is invoked', () => {
  it('should count down from period value before firing', () => {
    const timer = createTimer();
    timer.setPeriod(3);

    expect(timer.clock()).toBe(false); // 3 -> 2
    expect(timer.clock()).toBe(false); // 2 -> 1
    expect(timer.clock()).toBe(false); // 1 -> 0
    expect(timer.clock()).toBe(true);  // 0 -> fires
  });

  it('should reload period after firing', () => {
    const timer = createTimer();
    timer.setPeriod(2);

    timer.clock(); // 2 -> 1
    timer.clock(); // 1 -> 0
    timer.clock(); // fires, should reload to 2

    // Count down from 2 again
    expect(timer.clock()).toBe(false); // 2 -> 1
    expect(timer.clock()).toBe(false); // 1 -> 0
    expect(timer.clock()).toBe(true);  // 0 -> fires again
  });

  it('should handle period of 0 (fires every clock)', () => {
    const timer = createTimer();
    timer.setPeriod(0);

    expect(timer.clock()).toBe(true);
    expect(timer.clock()).toBe(true);
    expect(timer.clock()).toBe(true);
  });

  it('should reset counter when period is set', () => {
    const timer = createTimer();
    timer.setPeriod(4);

    timer.clock(); // 4 -> 3
    timer.clock(); // 3 -> 2

    // Set new period - should reset counter
    timer.setPeriod(5);

    expect(timer.clock()).toBe(false); // 5 -> 4
    expect(timer.clock()).toBe(false); // 4 -> 3
    expect(timer.clock()).toBe(false); // 3 -> 2
    expect(timer.clock()).toBe(false); // 2 -> 1
    expect(timer.clock()).toBe(false); // 1 -> 0 
    expect(timer.clock()).toBe(true);  // 0 -> fires
  });
});

describe('When getPeriod is invoked', () => {
  it('should return period value', () => {
    const timer = createTimer();
    timer.setPeriod(100);

    expect(timer.getPeriod()).toBe(100);
  });
});
