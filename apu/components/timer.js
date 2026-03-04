const createTimer = () => {
  let period = 0;
  let counter = 0;

  const setPeriod = (value) => {
    period = value;
    counter = value;
  };

  const clock = () => {
    if (counter === 0) {
      counter = period; // reload
      return true;      // fire
    }
    counter--;
    return false;
  };

  const getPeriod = () => period;

  return { setPeriod, clock, getPeriod };
};

module.exports = { createTimer };
