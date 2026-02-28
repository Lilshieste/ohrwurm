/*
Reference: https://www.nesdev.org/wiki/NSF

  offset  # of bytes   Function
  ----------------------------
  $000    5   STRING  'N','E','S','M',$1A (denotes an NES sound format file)
  $005    1   BYTE    Version number $01 (or $02 for NSF2)
  $006    1   BYTE    Total songs   (1=1 song, 2=2 songs, etc)
  $007    1   BYTE    Starting song (1=1st song, 2=2nd song, etc)
  $008    2   WORD    (lo, hi) load address of data ($8000-FFFF)
  $00A    2   WORD    (lo, hi) init address of data ($8000-FFFF)
  $00C    2   WORD    (lo, hi) play address of data ($8000-FFFF)
  $00E    32  STRING  The name of the song, null terminated
  $02E    32  STRING  The artist, if known, null terminated
  $04E    32  STRING  The copyright holder, null terminated
  $06E    2   WORD    (lo, hi) Play speed, in 1/1000000th sec ticks, NTSC (see text)
  $070    8   BYTE    Bankswitch init values (see text, and FDS section)
  $078    2   WORD    (lo, hi) Play speed, in 1/1000000th sec ticks, PAL (see text)
  $07A    1   BYTE    PAL/NTSC bits
                  bit 0: if clear, this is an NTSC tune
                  bit 0: if set, this is a PAL tune
                  bit 1: if set, this is a dual PAL/NTSC tune
                  bits 2-7: reserved, must be 0
  $07B    1   BYTE    Extra Sound Chip Support
                  bit 0: if set, this song uses VRC6 audio
                  bit 1: if set, this song uses VRC7 audio
                  bit 2: if set, this song uses FDS audio
                  bit 3: if set, this song uses MMC5 audio
                  bit 4: if set, this song uses Namco 163 audio
                  bit 5: if set, this song uses Sunsoft 5B audio
                  bit 6: if set, this song uses VT02+ audio
                  bit 7: reserved, must be zero
  $07C    1   BYTE    Reserved for NSF2
  $07D    3   BYTES   24-bit length of contained program data.
                  If 0, all data until end of file is part of the program.
                  If used, can be used to provide NSF2 metadata
                  in a backward compatible way.
  $080    nnn ----    The music program/data follows

*/

const readString = (data, offset, length) => {
  return Array.from(data.slice(offset, offset + length)).reduce((str, byte) => {
    if (byte === 0) return str;
    return str + String.fromCharCode(byte);
  }, '');
};

const readWord = (data, offset) => {
  return data[offset] | (data[offset + 1] << 8);
};

const parseMagicBytes = (data) => {
  const MagicBytes = [0x4E, 0x45, 0x53, 0x4D, 0x1A]; // "NESM\x1A"
  const actualMagicBytes = Array.from(data.slice(0x00, MagicBytes.length));

  if (actualMagicBytes.length !== MagicBytes.length
    || !actualMagicBytes.every((byte, index) => byte === MagicBytes[index])) {
      throw new Error('Invalid NSF file: bad magic bytes');
    }

  return actualMagicBytes;
};

const parseVersion = (data) => data[0x05];
const parseTotalSongs = (data) => data[0x06];
const parseStartingSong = (data) => data[0x07];
const parseLoadAddress = (data) => readWord(data, 0x08);
const parseInitAddress = (data) => readWord(data, 0x0A);
const parsePlayAddress = (data) => readWord(data, 0x0C);
const parseTitle = (data) => readString(data, 0x0E, 32);
const parseArtist = (data) => readString(data, 0x2E, 32);
const parseCopyright = (data) => readString(data, 0x4E, 32);
const parseNTSCSpeed = (data) => readWord(data, 0x6E);
const parseBankswitching = (data) => {
  const bankswitching = Array.from(data.slice(0x70, 0x78));
  const usesBankswitching = bankswitching.some(b => b !== 0);
  return { bankswitching, usesBankswitching };
};
const parsePALSpeed = (data) => readWord(data, 0x78);
const parseRegionFlags = (data) => {
  const regionFlags = data[0x7A];
  const isPal = (regionFlags & 0x01) !== 0;
  const isNtsc = (regionFlags & 0x02) !== 0 || !isPal;
  const isDualRegion = (regionFlags & 0x02) !== 0;
  return { regionFlags, isPal, isNtsc, isDualRegion };
};
const parseExtraChipFlags = (data) => {
  const extraChipFlags = data[0x7B];
  return {
    vrc6: (extraChipFlags & 0x01) !== 0,
    vrc7: (extraChipFlags & 0x02) !== 0,
    fds: (extraChipFlags & 0x04) !== 0,
    mmc5: (extraChipFlags & 0x08) !== 0,
    namco163: (extraChipFlags & 0x10) !== 0,
    sunsoft5b: (extraChipFlags & 0x20) !== 0,
  };
};
const parseMusicData = (data) => data.slice(0x80);

const parse = (data) => {
  if (!(data instanceof Uint8Array)) {
    data = new Uint8Array(data);
  }

  parseMagicBytes(data);
  const version = parseVersion(data);
  const totalSongs = parseTotalSongs(data);
  const startingSong = parseStartingSong(data);
  const loadAddress = parseLoadAddress(data);
  const initAddress = parseInitAddress(data);
  const playAddress = parsePlayAddress(data);

  const title = parseTitle(data);
  const artist = parseArtist(data);
  const copyright = parseCopyright(data);

  const ntscSpeed = parseNTSCSpeed(data);
  const { bankswitching, usesBankswitching } = parseBankswitching(data);
  const palSpeed = parsePALSpeed(data);

  const { isPal, isNtsc, isDualRegion } = parseRegionFlags(data);

  const { vrc6, vrc7, fds, mmc5, namco163, sunsoft5b } = parseExtraChipFlags(data);
  const extraChips = {
    fds,
    mmc5,
    namco163,
    sunsoft5b,
    vrc6,
    vrc7,
  };

  const musicData = parseMusicData(data);

  return {
    artist,
    bankswitching,
    copyright,
    extraChips,
    initAddress,
    isDualRegion,
    isNtsc,
    isPal,
    loadAddress,
    musicData,
    ntscSpeed,
    palSpeed,
    playAddress,
    startingSong,
    title,
    totalSongs,
    usesBankswitching,
    version,
  };
};

module.exports = { parse };
