const { createAPUDevice } = require('../../apu/apuDevice');
const { createMockAPU } = require('../mocks/apu');

describe('APU Device', () => {
  describe('read', () => {
    it('should pass $4015 reads through to apu.readStatus()', () => {
      const mockAPU = createMockAPU();
      mockAPU.readStatus.mockReturnValue(0x1F);
      const device = createAPUDevice(mockAPU);

      const result = device.read(0x4015);

      expect(mockAPU.readStatus).toHaveBeenCalled();
      expect(result).toBe(0x1F);
    });

    it('should return 0 for write-only registers', () => {
      const mockAPU = createMockAPU();
      const device = createAPUDevice(mockAPU);

      expect(device.read(0x4000)).toBe(0);
      expect(device.read(0x4001)).toBe(0);
      expect(device.read(0x4004)).toBe(0);
    });
  });

  describe('write', () => {
    it('should pass all writes through to apu.writeRegister()', () => {
      const mockAPU = createMockAPU();
      const device = createAPUDevice(mockAPU);

      device.write(0x4000, 0x3F);
      device.write(0x4015, 0x0F);

      expect(mockAPU.writeRegister).toHaveBeenCalledWith(0x4000, 0x3F);
      expect(mockAPU.writeRegister).toHaveBeenCalledWith(0x4015, 0x0F);
    });
  });

  describe('pass-through methods', () => {
    it('should expose clock()', () => {
      const mockAPU = createMockAPU();
      const device = createAPUDevice(mockAPU);

      device.clock(100);

      expect(mockAPU.clock).toHaveBeenCalledWith(100);
    });

    it('should expose getSamples()', () => {
      const mockAPU = createMockAPU();
      mockAPU.getSamples.mockReturnValue([0.5, 0.5]);
      const device = createAPUDevice(mockAPU);

      const result = device.getSamples(2);

      expect(mockAPU.getSamples).toHaveBeenCalledWith(2);
      expect(result).toEqual([0.5, 0.5]);
    });

    it('should expose reset()', () => {
      const mockAPU = createMockAPU();
      const device = createAPUDevice(mockAPU);

      device.reset();

      expect(mockAPU.reset).toHaveBeenCalled();
    });

    it('should expose setChannelMute()', () => {
      const mockAPU = createMockAPU();
      const device = createAPUDevice(mockAPU);

      device.setChannelMute('pulse1', true);

      expect(mockAPU.setChannelMute).toHaveBeenCalledWith('pulse1', true);
    });

    it('should expose getChannelMutes()', () => {
      const mockAPU = createMockAPU();
      mockAPU.getChannelMutes.mockReturnValue({ pulse1: true });
      const device = createAPUDevice(mockAPU);

      const result = device.getChannelMutes();

      expect(mockAPU.getChannelMutes).toHaveBeenCalled();
      expect(result).toEqual({ pulse1: true });
    });
  });
});
