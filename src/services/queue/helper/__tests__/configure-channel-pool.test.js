import { ChannelPool } from 'stompit';
import { configureChannelPool } from '../configure-channel-pool';

describe('configureChannelPool', () => {
  beforeEach(() => {
    configureChannelPool();
  });

  it('should create new ConnectionPool', () => {
    expect(ChannelPool).toHaveBeenCalledTimes(1);
  });

  it('should call ChannelPool with minimum number of channels as 0', () => {
    expect(ChannelPool).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        minChannels: 0
      })
    );
  });

  it('should call ChannelPool with minimum number of free channels as 0', () => {
    expect(ChannelPool).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        minFreeChannels: 0
      })
    );
  });

  it('should call ChannelPool with maximum number of channels as Infinity', () => {
    expect(ChannelPool).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        maxChannels: Infinity
      })
    );
  });

  it('should call ChannelPool with free excess timeout as null', () => {
    expect(ChannelPool).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        freeExcessTimeout: null
      })
    );
  });

  it('should call ChannelPool with the available connections', () => {
    expect(ChannelPool).toHaveBeenCalledWith(
      expect.objectContaining({
        on: expect.anything(),
        connect: expect.anything()
      }),
      expect.any(Object)
    );
  });
});
