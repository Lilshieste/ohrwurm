const { createNsfPlayer } = require('../../nsf/nsfPlayer');

describe('NsfPlayer (new API)', () => {
  // Helper to create a minimal valid NSF
  const createTestNsf = (overrides = {}) => {
    // Minimal NSF header + simple program
    const header = new Uint8Array(0x80).fill(0);
    // Magic bytes: "NESM\x1A"
    header[0] = 0x4E; header[1] = 0x45; header[2] = 0x53; header[3] = 0x4D; header[4] = 0x1A;
    header[0x05] = 0x01; // Version
    header[0x06] = overrides.totalSongs ?? 0x03; // Total songs
    header[0x07] = 0x01; // Starting song
    // Load address: $8000
    header[0x08] = 0x00; header[0x09] = 0x80;
    // Init address: $8000
    header[0x0A] = 0x00; header[0x0B] = 0x80;
    // Play address: $8010
    header[0x0C] = 0x10; header[0x0D] = 0x80;
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

    // Music data: init at $8000, play at $8010
    const musicData = new Uint8Array(32).fill(0x00);
    // Init routine: just RTS
    musicData[0] = 0x60;
    // Play routine at offset 0x10: just RTS
    musicData[0x10] = 0x60;

    return new Uint8Array([...header, ...musicData]);
  };

  describe('load()', () => {
    it('parses NSF data and returns metadata', () => {
      const player = createNsfPlayer();
      const nsfData = createTestNsf({ title: 'My Song', artist: 'My Artist' });

      const metadata = player.load(nsfData);

      expect(metadata.title).toBe('My Song');
      expect(metadata.artist).toBe('My Artist');
      expect(metadata.totalSongs).toBe(3);
    });

    it('throws on invalid NSF data', () => {
      const player = createNsfPlayer();
      const invalidData = new Uint8Array([0x00, 0x00, 0x00]);

      expect(() => player.load(invalidData)).toThrow();
    });
  });

  describe('selectSong()', () => {
    it('throws if no NSF loaded', () => {
      const player = createNsfPlayer();

      expect(() => player.selectSong(0)).toThrow('No NSF loaded');
    });

    it('initializes the song and allows reading samples', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());

      player.selectSong(0);

      // Should be able to read samples without error
      const samples = player.read(100);
      expect(samples).toBeInstanceOf(Float32Array);
      expect(samples.length).toBe(100);
    });

    it('resets state when selecting a new song', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());

      player.selectSong(0);
      player.read(1000);
      const stats1 = player.getStats();
      expect(stats1.framesExecuted).toBeGreaterThan(0);

      player.selectSong(1);
      const stats2 = player.getStats();
      expect(stats2.framesExecuted).toBe(0);
    });
  });

  describe('read()', () => {
    it('throws if no song selected', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());

      expect(() => player.read(100)).toThrow('No song selected');
    });

    it('returns exactly the requested number of samples', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());
      player.selectSong(0);

      const samples = player.read(2048);

      expect(samples.length).toBe(2048);
    });

    it('returns normalized samples in range [0, 1]', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());
      player.selectSong(0);

      const samples = player.read(1000);

      for (const sample of samples) {
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThanOrEqual(1);
      }
    });

    it('executes correct number of frames for 1 second of audio', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());
      player.selectSong(0);

      // 44100 samples = 1 second
      // Each frame produces ~734 samples (due to cycle rounding), so ~60-61 frames needed
      player.read(44100);
      const stats = player.getStats();

      expect(stats.framesExecuted).toBeGreaterThanOrEqual(60);
      expect(stats.framesExecuted).toBeLessThanOrEqual(61);
    });
  });

  describe('getMetadata()', () => {
    it('returns null if no NSF loaded', () => {
      const player = createNsfPlayer();

      expect(player.getMetadata()).toBeNull();
    });

    it('returns metadata after load', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf({ title: 'Hello', artist: 'World' }));

      const meta = player.getMetadata();

      expect(meta.title).toBe('Hello');
      expect(meta.artist).toBe('World');
    });
  });

  describe('getStats()', () => {
    it('returns zero stats before song selection', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());

      const stats = player.getStats();

      expect(stats.framesExecuted).toBe(0);
      expect(stats.bufferLevel).toBe(0);
    });

    it('tracks frames executed', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());
      player.selectSong(0);

      player.read(735); // ~1 frame worth of samples
      const stats1 = player.getStats();
      expect(stats1.framesExecuted).toBe(1);

      player.read(735); // another frame
      const stats2 = player.getStats();
      expect(stats2.framesExecuted).toBe(2);
    });
  });

  describe('channel muting', () => {
    it('can mute and unmute channels', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());
      player.selectSong(0);

      player.setChannelMute('pulse1', true);
      expect(player.getChannelMutes().pulse1).toBe(true);

      player.setChannelMute('pulse1', false);
      expect(player.getChannelMutes().pulse1).toBe(false);
    });
  });

  describe('getSystem()', () => {
    it('returns null before song selection', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());

      expect(player.getSystem()).toBeNull();
    });

    it('returns the NES system after song selection', () => {
      const player = createNsfPlayer();
      player.load(createTestNsf());
      player.selectSong(0);

      const system = player.getSystem();

      expect(system).not.toBeNull();
      expect(system.apu).toBeDefined();
      expect(system.registers).toBeDefined();
    });
  });
});
