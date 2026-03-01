#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('../nsf/parser');

const NSF_DIR = process.argv[2] || path.join(process.env.HOME, 'dev/NSFs');

const findNsfFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files
    .filter(f => f.toLowerCase().endsWith('.nsf'))
    .map(f => path.join(dir, f));
};

const main = () => {
  console.log(`Scanning: ${NSF_DIR}\n`);

  const nsfFiles = findNsfFiles(NSF_DIR);
  const results = { bankswitched: [], nonBankswitched: [] };

  for (const filePath of nsfFiles) {
    try {
      const data = fs.readFileSync(filePath);
      const nsf = parse(data);
      const fileName = path.basename(filePath);

      if (nsf.usesBankswitching) {
        results.bankswitched.push({ fileName, nsf });
      } else {
        results.nonBankswitched.push({ fileName, nsf });
      }
    } catch (err) {
      console.error(`Error parsing ${filePath}: ${err.message}`);
    }
  }

  console.log('=== Non-Bankswitched NSFs ===');
  for (const { fileName, nsf } of results.nonBankswitched) {
    console.log(`  ${fileName}`);
    console.log(`    Title: ${nsf.title}`);
    console.log(`    Artist: ${nsf.artist}`);
    console.log(`    Songs: ${nsf.totalSongs}`);
    console.log();
  }

  console.log(`\n=== Summary ===`);
  console.log(`Non-bankswitched: ${results.nonBankswitched.length}`);
  console.log(`Bankswitched: ${results.bankswitched.length}`);
};

main();
