#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('../nsf/parser');
const { createNsfPlayer } = require('../nsf/player');
const { createNES } = require('../devices/nes');
const { createInstructionSet } = require('../6502/instructions');

const NSF_DIR = process.argv[2] || path.join(process.env.HOME, 'dev/NSFs');
const FRAMES_TO_ANALYZE = 300; // ~5 seconds at 60fps
const SENTINEL_ADDRESS = 0x0000;

// APU register ranges for each channel
const CHANNEL_REGISTERS = {
  pulse1: { start: 0x4000, end: 0x4003 },
  pulse2: { start: 0x4004, end: 0x4007 },
  triangle: { start: 0x4008, end: 0x400B },
  noise: { start: 0x400C, end: 0x400F },
  dmc: { start: 0x4010, end: 0x4013 },
};

// $4015 bit masks for channel enable
const ENABLE_BITS = {
  pulse1: 0x01,
  pulse2: 0x02,
  triangle: 0x04,
  noise: 0x08,
  dmc: 0x10,
};

const findNsfFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files
    .filter(f => f.toLowerCase().endsWith('.nsf'))
    .map(f => path.join(dir, f));
};

const analyzeNsf = (filePath) => {
  const data = fs.readFileSync(filePath);
  const nsf = parse(data);

  // Skip bankswitched NSFs (not supported yet)
  if (nsf.usesBankswitching) {
    return { nsf, skipped: true, reason: 'bankswitched' };
  }

  // Track which channels have registers written and are enabled
  const channelWrites = {
    pulse1: false,
    pulse2: false,
    triangle: false,
    noise: false,
    dmc: false,
  };
  const channelEnabled = {
    pulse1: false,
    pulse2: false,
    triangle: false,
    noise: false,
    dmc: false,
  };

  // Create system with register tracking
  const system = createNES();
  const originalPoke = system.poke;

  system.poke = (memory, address, value) => {
    // Track channel register writes
    for (const [channel, range] of Object.entries(CHANNEL_REGISTERS)) {
      if (address >= range.start && address <= range.end) {
        channelWrites[channel] = true;
      }
    }

    // Track $4015 writes (channel enable)
    if (address === 0x4015) {
      for (const [channel, bit] of Object.entries(ENABLE_BITS)) {
        if (value & bit) {
          channelEnabled[channel] = true;
        }
      }
    }

    return originalPoke(memory, address, value);
  };

  const instructionSet = createInstructionSet();
  const nsfPlayer = createNsfPlayer(system, instructionSet, SENTINEL_ADDRESS);

  try {
    // Run init
    nsfPlayer.loadNSF(nsf, 0);

    // Run several frames of play
    for (let i = 0; i < FRAMES_TO_ANALYZE; i++) {
      nsfPlayer.play(nsf);
    }
  } catch (err) {
    return { nsf, skipped: true, reason: err.message };
  }

  // Determine which channels are "used" (both written to AND enabled)
  const channelsUsed = {};
  for (const channel of Object.keys(channelWrites)) {
    channelsUsed[channel] = channelWrites[channel] && channelEnabled[channel];
  }

  return {
    nsf,
    skipped: false,
    channelWrites,
    channelEnabled,
    channelsUsed,
  };
};

const formatChannels = (channels, showAll = false) => {
  const active = Object.entries(channels)
    .filter(([_, used]) => showAll || used)
    .map(([name, used]) => used ? name.toUpperCase() : name)
    .join(', ');
  return active || '(none)';
};

const main = () => {
  console.log(`Scanning: ${NSF_DIR}`);
  console.log(`Analyzing ${FRAMES_TO_ANALYZE} frames per file (~${Math.round(FRAMES_TO_ANALYZE / 60)}s)\n`);

  const nsfFiles = findNsfFiles(NSF_DIR);
  const results = {
    analyzed: [],
    skipped: [],
    withDMC: [],
  };

  for (const filePath of nsfFiles) {
    const fileName = path.basename(filePath);
    process.stdout.write(`Analyzing ${fileName}... `);

    try {
      const result = analyzeNsf(filePath);
      result.fileName = fileName;

      if (result.skipped) {
        console.log(`skipped (${result.reason})`);
        results.skipped.push(result);
      } else {
        const channels = Object.entries(result.channelsUsed)
          .filter(([_, used]) => used)
          .map(([name]) => name);
        console.log(channels.join(', ') || '(none)');
        results.analyzed.push(result);

        if (result.channelsUsed.dmc) {
          results.withDMC.push(result);
        }
      }
    } catch (err) {
      console.log(`error: ${err.message}`);
      results.skipped.push({ fileName, skipped: true, reason: err.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${nsfFiles.length}`);
  console.log(`Analyzed: ${results.analyzed.length}`);
  console.log(`Skipped: ${results.skipped.length}`);

  // Channel usage stats
  const channelCounts = { pulse1: 0, pulse2: 0, triangle: 0, noise: 0, dmc: 0 };
  for (const result of results.analyzed) {
    for (const [channel, used] of Object.entries(result.channelsUsed)) {
      if (used) channelCounts[channel]++;
    }
  }

  console.log('\nChannel usage:');
  for (const [channel, count] of Object.entries(channelCounts)) {
    const pct = results.analyzed.length > 0
      ? Math.round(100 * count / results.analyzed.length)
      : 0;
    console.log(`  ${channel.padEnd(10)} ${count} files (${pct}%)`);
  }

  // Files with DMC
  if (results.withDMC.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('FILES USING DMC CHANNEL');
    console.log('='.repeat(60));
    for (const result of results.withDMC) {
      console.log(`  ${result.fileName}`);
      console.log(`    Title: ${result.nsf.title}`);
    }
  } else {
    console.log('\nNo files using DMC channel found.');
  }
};

main();
