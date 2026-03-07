// Clock divider that fires an action after a specified number of cycles
const createWatcher = (period, action) => {
  let counter = 0;

  return {
    clock: () => {
      counter++;
      if (counter >= period) {
        counter -= period;
        action();
      }
    },
    reset: () => {
      counter = 0;
    },
  };
};

module.exports = { createWatcher };
