import {
  mockChannel,
  mockedMessageOnQueue,
  mockMessageStream
} from '../../../../__mocks__/stompit';
import channelPool from '../../helper/configure-channel-pool';
import { consumeOneMessage } from '../consume-one-message';

jest.mock('../../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613'],
    queueName: 'gp2gp-test'
  })
}));
jest.mock('../../helper/configure-channel-pool');

describe('consumeOneMessage', () => {
  const mockQueueName = 'gp2gp-test';
  const defaultOptions = { destination: mockQueueName, ack: 'client-individual' };

  afterEach(() => {
    mockChannel.subscribe.mockImplementation((_, callback) =>
      callback(false, mockMessageStream, { unsubscribe: jest.fn() })
    );
    channelPool.channel.mockImplementation(callback => callback(false, mockChannel));
  });

  afterEach(() => {
    mockChannel.subscribe.mockImplementation(callback =>
      callback(false, mockChannel, { unsubscribe: jest.fn() })
    );
  });

  it('should consume a message from the queue', () => {
    return expect(consumeOneMessage()).resolves.toEqual(mockedMessageOnQueue);
  });

  it('should call channelPool.channel', async done => {
    await consumeOneMessage();
    expect(channelPool.channel).toHaveBeenCalledTimes(1);
    expect(channelPool.channel).toHaveBeenCalledWith(expect.any(Function));
    done();
  });

  describe('channelPool.subscribe', () => {
    it('should call channel.subscribe', async done => {
      await consumeOneMessage();
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockChannel.subscribe).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
      done();
    });

    it('should call channel.subscribe with default options', async done => {
      await consumeOneMessage();
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockChannel.subscribe).toHaveBeenCalledWith(defaultOptions, expect.any(Function));
      done();
    });

    it('should call channel.subscribe with options when passed in, along with default options', async done => {
      const options = { option: 'option' };
      const expectedOptions = {
        destination: mockQueueName,
        ack: 'client-individual',
        option: 'option'
      };
      await consumeOneMessage(options);
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockChannel.subscribe).toHaveBeenCalledWith(
        expect.objectContaining(expectedOptions),
        expect.any(Function)
      );
      done();
    });

    it('should call channel.subscribe with options that replace default options', async done => {
      const options = { destination: 'another-queue-name', ack: 'client' };
      await consumeOneMessage(options);
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockChannel.subscribe).toHaveBeenCalledWith(
        expect.objectContaining(options),
        expect.any(Function)
      );
      done();
    });

    it('should return an error if channel is unable to connect', () => {
      channelPool.channel.mockImplementation(callback =>
        callback('some-connection-error', mockChannel)
      );
      return expect(consumeOneMessage()).rejects.toBe('some-connection-error');
    });
  });

  describe('subscribeCallback', () => {
    it('should call stream.readString with utf-8', async done => {
      await consumeOneMessage();
      expect(mockMessageStream.readString).toHaveBeenCalledTimes(1);
      expect(mockMessageStream.readString).toHaveBeenCalledWith('utf-8', expect.anything());
      done();
    });

    it('should call stream.readString with a callback function', async done => {
      await consumeOneMessage();
      expect(mockMessageStream.readString).toHaveBeenCalledTimes(1);
      expect(mockMessageStream.readString).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Function)
      );
      done();
    });

    it('should reject the promise with error when error with reading the message stream', () => {
      const messageStreamError = Error('something-went-wrong');
      const mockMessageStreamError = {
        readString: jest.fn().mockImplementation((_, callback) => {
          callback(messageStreamError);
        })
      };

      mockChannel.subscribe.mockImplementation((_, callback) =>
        callback(messageStreamError, mockMessageStreamError, { unsubscribe: jest.fn() })
      );
      return expect(consumeOneMessage()).rejects.toEqual(messageStreamError);
    });

    it('should call channel.ack with the message stream', async done => {
      await consumeOneMessage();
      expect(mockChannel.ack).toHaveBeenCalledTimes(1);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessageStream);
      done();
    });

    it('should call channel.disconnect', async done => {
      await consumeOneMessage();
      expect(mockChannel.close).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
