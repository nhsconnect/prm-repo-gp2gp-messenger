import { mockChannel, mockMessageStream } from '../../../../__mocks__/stompit';
import { MOCKED_UUID } from '../../../../__mocks__/uuid';
import { sendToQueue } from '../../publisher/send-to-queue';
import { clearQueue } from '../clear-queue';
import channelPool from '../configure-channel-pool';

jest.mock('../../publisher/send-to-queue');
jest.mock('../../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    queueName: 'mocked-queue-name',
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613']
  })
}));
jest.mock('../configure-channel-pool');

describe('clearQueue', () => {
  const mockQueueName = 'mocked-queue-name';
  const defaultOptions = { destination: mockQueueName, ack: 'client-individual' };
  const mockedMessage = 'mocked-message';
  const mockUnsubscribe = jest.fn();

  afterEach(() => {
    mockChannel.subscribe.mockImplementation((_, callback) =>
      callback(false, mockMessageStream, { unsubscribe: mockUnsubscribe })
    );
    mockMessageStream.readString.mockImplementation((_, callback) => {
      callback(false, mockedMessage);
    });
    channelPool.channel.mockImplementation(callback => callback(false, mockChannel));
  });

  describe('sendToQueue', () => {
    it('should call sendToQueue with EOQ-MOCKED_UUID', async done => {
      await clearQueue();
      expect(sendToQueue).toHaveBeenCalledTimes(1);
      expect(sendToQueue).toHaveBeenCalledWith(`EOQ-${MOCKED_UUID}`, expect.any(Object));
      done();
    });
  });

  describe('channelPool.channel', () => {
    it('should call channelPool.channel with callback function', async done => {
      await clearQueue();
      expect(channelPool.channel).toHaveBeenCalledTimes(1);
      expect(channelPool.channel).toHaveBeenCalledWith(expect.any(Function));
      done();
    });

    it('should reject with error when error connecting with the queue', () => {
      const connectQueueError = Error('something-went-wrong');
      channelPool.channel.mockImplementation(callback => callback(connectQueueError, mockChannel));
      return expect(clearQueue()).rejects.toEqual(connectQueueError);
    });
  });

  describe('channel.subscribe', () => {
    it('should call channel.subscribe with default options and function', async done => {
      await clearQueue();
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockChannel.subscribe).toHaveBeenCalledWith(
        expect.objectContaining(defaultOptions),
        expect.any(Function)
      );
      done();
    });

    it('should call channel.subscribe with passed in options as well as default options', async done => {
      const options = { anotherOption: 'another-one' };
      const expectedOptions = {
        destination: mockQueueName,
        ack: 'client-individual',
        anotherOption: 'another-one'
      };
      await clearQueue(options);
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockChannel.subscribe).toHaveBeenCalledWith(
        expect.objectContaining(expectedOptions),
        expect.any(Function)
      );
      done();
    });

    it('should reject with error if unable to subscribe to channel', () => {
      const channelWithError = Error('something-went-wrong');
      mockChannel.subscribe.mockImplementation((_, callback) =>
        callback(channelWithError, mockMessageStream, { unsubscribe: mockUnsubscribe })
      );
      return expect(clearQueue()).rejects.toEqual(channelWithError);
    });
  });

  describe('messageStream.readString', () => {
    it('should call message messageStream.readString with utf-8 and a function', async done => {
      await clearQueue();
      expect(mockMessageStream.readString).toHaveBeenCalledTimes(1);
      expect(mockMessageStream.readString).toHaveBeenCalledWith('utf-8', expect.any(Function));
      done();
    });

    it('should reject with error if error reading message stream', () => {
      const readStringError = Error('something-went-wrong');
      mockMessageStream.readString.mockImplementation((_, callback) => {
        callback(readStringError, mockedMessage);
      });
      return expect(clearQueue()).rejects.toEqual(readStringError);
    });

    it('should call channel.ack with the message stream', async done => {
      await clearQueue();
      expect(mockChannel.ack).toHaveBeenCalledTimes(1);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessageStream);
      done();
    });

    it('should not call channel.close if message is not endOfQueueMessage', async done => {
      await clearQueue();
      expect(mockChannel.close).toHaveBeenCalledTimes(0);
      done();
    });

    it('should call channel.close if message is endOfQueueMessage', async done => {
      mockMessageStream.readString.mockImplementation((_, callback) => {
        callback(false, `EOQ-${MOCKED_UUID}`);
      });
      await clearQueue();
      expect(mockChannel.close).toHaveBeenCalledTimes(1);
      done();
    });

    it('should call subscription.unsubscribe if message is endOfQueueMessage', async done => {
      mockMessageStream.readString.mockImplementation((_, callback) => {
        callback(false, `EOQ-${MOCKED_UUID}`);
      });
      await clearQueue();
      expect(mockChannel.close).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
