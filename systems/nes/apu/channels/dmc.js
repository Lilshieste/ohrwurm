// https://www.nesdev.org/wiki/APU_DMC
const { createTimer } = require('../timer');

// NTSC rate table (CPU cycles per output clock, indexed by lower 4 bits of $4010)
const RateTable = [
  428, 380, 340, 320, 286, 254, 226, 214,
  190, 160, 142, 128, 106, 84, 72, 54
];

const createDMCChannel = () => {
  // Rate timer
  const timer = createTimer();
  timer.setPeriod(RateTable[0]);

  // Flags from $4010
  let loopFlag = false;

  // Output level (7-bit, 0-127)
  let outputLevel = 0;

  // Sample address and length registers (values written to $4012/$4013)
  let sampleAddress = 0xC000;
  let sampleLength = 1;

  // Memory reader state
  let currentAddress = 0xC000;
  let bytesRemaining = 0;

  // Sample buffer (holds fetched byte until needed)
  let sampleBufferByte = undefined;

  // Output unit state
  let shiftRegister = 0;
  let bitsRemaining = 0;
  let silenceFlag = true;

  // Status
  let enabled = false;

  // Memory read callback (injected via setMemoryReader)
  let readMemory = null;

  const isShiftRegisterEmpty = () => {
    return bitsRemaining === 0;
  };

  const isSampleBufferEmpty = () => {
    return sampleBufferByte === undefined;
  };

  // Restart sample from beginning
  const restart = () => {
    currentAddress = sampleAddress;
    bytesRemaining = sampleLength;
  };

  // Fetch a byte from sample memory into the buffer
  const fetchSampleByte = () => {
    if (readMemory === null) {
      throw new Error('DMC channel memory reader not set');
    }

    if (bytesRemaining === 0) {
      return;
    }

    // Read byte from current address
    sampleBufferByte = readMemory(currentAddress);

    // Increment address (wraps from $FFFF to $8000)
    currentAddress++;
    if (currentAddress > 0xFFFF) {
      currentAddress = 0x8000;
    }

    // Decrement bytes remaining
    bytesRemaining--;

    // If no bytes remaining, either loop or stop
    if (bytesRemaining === 0 && loopFlag) {
      restart();
    }
  };

  // Clock the output unit (called when timer fires)
  const clockOutputUnit = () => {
    // If shift register is empty, reload from buffer
    if (isShiftRegisterEmpty()) {
      bitsRemaining = 8;
      if (isSampleBufferEmpty()) {
        silenceFlag = true;
      } else {
        silenceFlag = false;
        shiftRegister = sampleBufferByte;
        sampleBufferByte = undefined;

        // Try to fetch next byte
        fetchSampleByte();
      }
    }

    // Output a bit (modulate output level)
    if (!silenceFlag) {
      const bit = shiftRegister & 0x01;
      if (bit === 1) {
        // Add 2 to output level, clamp at 127
        outputLevel = Math.min(127, outputLevel + 2);
      } else {
        // Subtract 2 from output level, clamp at 0
        outputLevel = Math.max(0, outputLevel - 2);
      }
    }

    // Shift register right
    shiftRegister >>= 1;
    bitsRemaining--;
  };

  // $4010: -L-- RRRR (Loop, Rate index)
  const writeControl = (value) => {
    loopFlag = (value & 0x40) !== 0;
    const rateIndex = value & 0x0F;
    timer.setPeriod(RateTable[rateIndex]);
  };

  // $4011: -DDD DDDD (Direct load, 7-bit)
  const writeDirectLoad = (value) => {
    outputLevel = value & 0x7F;
  };

  // $4012: AAAA AAAA (Sample address = $C000 + A*64)
  const writeSampleAddress = (value) => {
    sampleAddress = 0xC000 + (value * 64);
  };

  // $4013: LLLL LLLL (Sample length = L*16 + 1 bytes)
  const writeSampleLength = (value) => {
    sampleLength = (value * 16) + 1;
  };

  // Clock timer (called at half CPU rate, like pulse/noise)
  const clockTimer = () => {
    if (timer.clock()) {
      clockOutputUnit();
      return true;
    }
    return false;
  };

  // Get current output (always returns output level, even when disabled)
  const getOutput = () => {
    return outputLevel;
  };

  // Enable/disable channel (via $4015 bit 4)
  const setEnabled = (value) => {
    enabled = value;
    if (!enabled) {
      bytesRemaining = 0;
    } else {
      // If enabling and no bytes remaining, restart sample
      if (bytesRemaining === 0) {
        restart();
        // Immediately fetch first byte so buffer is ready
        fetchSampleByte();
      }
    }
  };

  // Check if channel is active (for $4015 status read)
  const isActive = () => bytesRemaining > 0;

  // Inject memory reader callback
  const setMemoryReader = (reader) => {
    readMemory = reader;
  };

  return {
    // Register writes
    writeControl,
    writeDirectLoad,
    writeSampleAddress,
    writeSampleLength,

    // Timing
    clockTimer,

    // Output
    getOutput,

    // Enable/disable
    setEnabled,

    // Status
    isActive,

    // Memory access (must be set before use)
    setMemoryReader,
  };
};

module.exports = { createDMCChannel };
