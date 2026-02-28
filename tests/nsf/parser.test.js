const { parse } = require('../../nsf/parser');

const HeaderSize = 128; // 0x00-0x80 is 128 bytes

describe('NSF Parser', () => {
  const createValidHeader = (overrides = {}) => {
    const header = new Uint8Array(HeaderSize);

    // Magic: "NESM\x1A"
    header[0x00] = 0x4E;
    header[0x01] = 0x45;
    header[0x02] = 0x53;
    header[0x03] = 0x4D;
    header[0x04] = 0x1A;

    // Version
    header[0x05] = overrides.version ?? 1;

    // Songs
    header[0x06] = overrides.totalSongs ?? 10;
    header[0x07] = overrides.startingSong ?? 1;

    // Addresses (little-endian)
    header[0x08] = overrides.loadAddressLo ?? 0x00;
    header[0x09] = overrides.loadAddressHi ?? 0x80;
    header[0x0A] = overrides.initAddressLo ?? 0x00;
    header[0x0B] = overrides.initAddressHi ?? 0x80;
    header[0x0C] = overrides.playAddressLo ?? 0x03;
    header[0x0D] = overrides.playAddressHi ?? 0x80;

    // Title
    const title = overrides.title ?? 'Test Song';
    for (let i = 0; i < title.length; i++) {
      header[0x0E + i] = title.charCodeAt(i);
    }

    // Artist
    const artist = overrides.artist ?? 'Test Artist';
    for (let i = 0; i < artist.length; i++) {
      header[0x2E + i] = artist.charCodeAt(i);
    }

    // Copyright
    const copyright = overrides.copyright ?? '2026 Test Copyright';
    for (let i = 0; i < copyright.length; i++) {
      header[0x4E + i] = copyright.charCodeAt(i);
    }

    // NTSCSpeed
    header[0x6E] = 0xFF;
    header[0x6F] = 0x10;

    // PAL speed
    header[0x78] = 0x06;
    header[0x79] = 0x4E;

    // Region flags
    header[0x7A] = overrides.regionFlags ?? 0;

    // Extra chip flags
    header[0x7B] = overrides.extraChipFlags ?? 0;

    return header;
  };

  describe('magic bytes validation', () => {
    it('throws on invalid magic bytes', () => {
      const badData = new Uint8Array(HeaderSize);
      badData[0] = 0x00;

      expect(() => parse(badData)).toThrow('Invalid NSF file: bad magic bytes');
    });

    it('accepts valid magic bytes', () => {
      const header = createValidHeader();
      expect(() => parse(header)).not.toThrow();
    });
  });

  describe('When parsing NSF headers', () => {
    it('Parses version at the expected offset', () => {
      const header = createValidHeader({ version: 2 });
      const result = parse(header);
      expect(result.version).toBe(2);
    });

    it('Parses song counts at the expected offset', () => {
      const header = createValidHeader({ totalSongs: 24, startingSong: 5 });
      const result = parse(header);
      expect(result.totalSongs).toBe(24);
      expect(result.startingSong).toBe(5);
    });

    it('Parses addresses as little-endian at the expected offsets', () => {
      const header = createValidHeader({
        loadAddressLo: 0x00, loadAddressHi: 0x80,
        initAddressLo: 0x10, initAddressHi: 0x80,
        playAddressLo: 0x20, playAddressHi: 0x80,
      });
      const result = parse(header);
      expect(result.loadAddress).toBe(0x8000);
      expect(result.initAddress).toBe(0x8010);
      expect(result.playAddress).toBe(0x8020);
    });

    it('Parses title string at the expected offset', () => {
      const header = createValidHeader({ title: 'Mega Man 2' });
      const result = parse(header);
      expect(result.title).toBe('Mega Man 2');
    });

    it('Parses artist string at the expected offset', () => {
      const header = createValidHeader({ artist: 'Capcom' });
      const result = parse(header);
      expect(result.artist).toBe('Capcom');
    });

    it('Parses copyright string at the expected offset', () => {
      const header = createValidHeader({ copyright: '1988 Capcom' });
      const result = parse(header);
      expect(result.copyright).toBe('1988 Capcom');
    });
  });

  describe('When parsing region flags', () => {
    it('Defaults to NTSC when no flags are set', () => {
      const header = createValidHeader({ regionFlags: 0x00 });
      const result = parse(header);
      expect(result.isNtsc).toBe(true);
      expect(result.isPal).toBe(false);
    });

    it('Parses PAL flag', () => {
      const header = createValidHeader({ regionFlags: 0x01 });
      const result = parse(header);
      expect(result.isPal).toBe(true);
    });

    it('Parses dual region flag', () => {
      const header = createValidHeader({ regionFlags: 0x02 });
      const result = parse(header);
      expect(result.isDualRegion).toBe(true);
    });
  });

  describe('When parsing extra chip flags', () => {
    it('Parses no extra chips when none are present', () => {
      const header = createValidHeader({ extraChipFlags: 0x00 });
      const result = parse(header);
      expect(result.extraChips.vrc6).toBe(false);
      expect(result.extraChips.vrc7).toBe(false);
      expect(result.extraChips.fds).toBe(false);
      expect(result.extraChips.mmc5).toBe(false);
      expect(result.extraChips.namco163).toBe(false);
      expect(result.extraChips.sunsoft5b).toBe(false);
    });

    it('Parses VRC6 chip flag', () => {
      const header = createValidHeader({ extraChipFlags: 0x01 });
      const result = parse(header);
      expect(result.extraChips.vrc6).toBe(true);
    });

    it('Parses multiple chip flags from bitmask', () => {
      const header = createValidHeader({ extraChipFlags: 0x05 }); // vrc6 | fds
      const result = parse(header);
      expect(result.extraChips.vrc6).toBe(true);
      expect(result.extraChips.fds).toBe(true);
      expect(result.extraChips.vrc7).toBe(false);
    });
  });

  describe('When parsing music data', () => {
    it('Extracts music data after header', () => {
      const header = createValidHeader();
      const musicBytes = [0x01, 0x02, 0x03, 0x04, 0x05];
      const allBytes = [...header, ...musicBytes];

      const result = parse(allBytes);

      expect(result.musicData.length).toBe(musicBytes.length);
      expect(result.musicData.every((byte, index) => byte === musicBytes[index])).toBe(true);
    });
  });

  describe('When parsing bankswitching values', () => {
    it('Detects no bankswitching when all zeros', () => {
      const header = createValidHeader();
      const result = parse(header);
      expect(result.usesBankswitching).toBe(false);
    });

    it('Detects bankswitching when a non-zero value is present', () => {
      const header = createValidHeader();
      header[0x70] = 0x01;
      const result = parse(header);
      expect(result.usesBankswitching).toBe(true);
    });
  });
});
