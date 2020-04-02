import config from '../../../../config';
import { mockClient, mockMessageStream } from '../../../../__mocks__/stompit';
import { MOCKED_UUID } from '../../../../__mocks__/uuid';
import { sendToQueueOld } from '../../publisher/send-to-queue-old';
import { clearQueue } from '../clear-queue';
import { connectToQueue } from '../connect-to-queue';

jest.mock('../../publisher/send-to-queue-old');
jest.mock('../connect-to-queue');

const originalConfig = config;
const mockedQueueName = 'mocked-queue-name';
const defaultOptions = { destination: mockedQueueName, ack: 'client-individual' };
const mockedMessage = 'mocked-message';

describe('clearQueue', () => {
  beforeEach(() => {
    config.queueName = mockedQueueName;
  });

  afterEach(() => {
    config.queueName = originalConfig.queueName;
    mockClient.subscribe.mockImplementation((_, callback) => callback(false, mockMessageStream));
    mockMessageStream.readString.mockImplementation((_, callback) => {
      callback(false, mockedMessage);
    });
    connectToQueue.mockImplementation(callback => callback(false, mockClient));
  });

  describe('sendToQueue', () => {
    it('should call sendToQueueOld with EOQ-MOCKED_UUID', async done => {
      await clearQueue();
      expect(sendToQueueOld).toHaveBeenCalledTimes(1);
      expect(sendToQueueOld).toHaveBeenCalledWith(`EOQ-${MOCKED_UUID}`, expect.any(Object));
      done();
    });
  });

  describe('connectToQueue', () => {
    it('should call connectToQueue with callback function', async done => {
      await clearQueue();
      expect(connectToQueue).toHaveBeenCalledTimes(1);
      expect(connectToQueue).toHaveBeenCalledWith(expect.any(Function));
      done();
    });

    it('should reject with error when error connecting with the queue', () => {
      const connectQueueError = Error('something-went-wrong');
      connectToQueue.mockImplementation(callback => callback(connectQueueError, mockClient));
      return expect(clearQueue()).rejects.toEqual(connectQueueError);
    });
  });

  describe('client.subscribe', () => {
    it('should call client.subscribe with default options and function', async done => {
      await clearQueue();
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining(defaultOptions),
        expect.any(Function)
      );
      done();
    });

    it('should call client.subscribe with passed in options as well as default options', async done => {
      const options = { anotherOption: 'another-one' };
      const expectedOptions = {
        destination: mockedQueueName,
        ack: 'client-individual',
        anotherOption: 'another-one'
      };
      await clearQueue(options);
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining(expectedOptions),
        expect.any(Function)
      );
      done();
    });

    it('should reject with error if unable to subscribe to client', () => {
      const clientWithError = Error('something-went-wrong');
      mockClient.subscribe.mockImplementation((_, callback) =>
        callback(clientWithError, mockMessageStream)
      );
      return expect(clearQueue()).rejects.toEqual(clientWithError);
    });
  });

  describe('stream.readString', () => {
    it('should call message stream.readString with utf-8 and a function', async done => {
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

    it('should call client.ack with the message stream', async done => {
      await clearQueue();
      expect(mockClient.ack).toHaveBeenCalledTimes(1);
      expect(mockClient.ack).toHaveBeenCalledWith(mockMessageStream);
      done();
    });

    it('should not call client.disconnect if message is not endOfQueueMessage', async done => {
      await clearQueue();
      expect(mockClient.disconnect).toHaveBeenCalledTimes(0);
      done();
    });

    it('should call client.disconnect if message is endOfQueueMessage', async done => {
      mockMessageStream.readString.mockImplementation((_, callback) => {
        callback(false, `EOQ-${MOCKED_UUID}`);
      });
      await clearQueue();
      expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
