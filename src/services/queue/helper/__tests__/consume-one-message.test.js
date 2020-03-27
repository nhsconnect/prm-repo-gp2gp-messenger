import config from '../../../../config';
import {
  mockClient,
  MOCKED_MESSAGE_ON_QUEUE,
  mockMessageStream
} from '../../../../__mocks__/stompit';
import { connectToQueue } from '../connect-to-queue';
import { consumeOneMessage } from '../consume-one-message';

const originalConfig = { ...config };

jest.mock('../connect-to-queue');

describe('consumeOneMessage', () => {
  let defaultOptions;

  afterEach(async () => {
    config.queueName = originalConfig.queueName;
  });

  beforeEach(() => {
    config.queueName = 'gp2gp-test';

    mockClient.subscribe.mockImplementation((_, callback) => callback(false, mockMessageStream));
    connectToQueue.mockImplementation(callback => callback(false, mockClient));
    defaultOptions = { destination: config.queueName, ack: 'client-individual' };
  });

  it('should consume a message from the queue', () => {
    return expect(consumeOneMessage()).resolves.toEqual(MOCKED_MESSAGE_ON_QUEUE);
  });

  it('should call connectToQueue', async done => {
    await consumeOneMessage();
    expect(connectToQueue).toHaveBeenCalledTimes(1);
    expect(connectToQueue).toHaveBeenCalledWith(expect.any(Function));
    done();
  });

  describe('connectToQueue', () => {
    it('should call client.subscribe', async done => {
      await consumeOneMessage();
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
      done();
    });

    it('should call client.subscribe with default options', async done => {
      await consumeOneMessage();
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(defaultOptions, expect.any(Function));
      done();
    });

    it('should call client.subscribe with options when passed in, along with default options', async done => {
      const options = { option: 'option' };
      await consumeOneMessage(options);
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({ ...options, ...defaultOptions }),
        expect.any(Function)
      );
      done();
    });

    it('should call client.subscribe with options that replace default options', async done => {
      const options = { destination: 'another-queue-name', ack: 'client' };
      await consumeOneMessage(options);
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining(options),
        expect.any(Function)
      );
      done();
    });

    it('should call client.subscribe with options when passed in', async done => {
      const options = { option: 'option' };
      await consumeOneMessage(options);
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining(options),
        expect.any(Function)
      );
      done();
    });

    it('should return an error if client is unable to connect', () => {
      connectToQueue.mockImplementation(callback => callback('some-connection-error', mockClient));
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

      mockClient.subscribe.mockImplementation((_, callback) =>
        callback(messageStreamError, mockMessageStreamError)
      );
      return expect(consumeOneMessage()).rejects.toEqual(messageStreamError);
    });

    it('should call client.ack', async done => {
      await consumeOneMessage();
      expect(mockClient.ack).toHaveBeenCalledTimes(1);
      done();
    });

    it('should call client.disconnect', async done => {
      await consumeOneMessage();
      expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
