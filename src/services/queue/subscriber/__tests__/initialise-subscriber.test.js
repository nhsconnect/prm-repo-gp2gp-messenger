import { logEvent, logError } from '../../../../middleware/logging';
import { mockChannel } from '../../../../__mocks__/stompit';
import { channelPool } from '../../helper';
import { initialiseSubscriber } from '../initialise-subscriber';
import { subscriberReadMessageCallback } from '../subscriber-read-message-callback';

jest.mock('../../../../middleware/logging');
jest.mock('../subscriber-read-message-callback');
jest.mock('../../helper/connect-to-queue');
jest.mock('../../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613'],
    queueName: 'mock-queue'
  })
}));

describe('initialiseSubscriber', () => {
  const mockQueueName = 'mock-queue';
  const mockError = 'mock-error';

  describe('configuration', () => {
    it('should call channel.subscribe with new queueName when passed in, and not override default options', async done => {
      await initialiseSubscriber({ destination: 'new-queue-name' });
      expect(mockChannel.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'new-queue-name',
          ack: 'auto'
        }),
        expect.any(Function)
      );
      done();
    });

    it('should call logEvent with new queueName when passed in', async done => {
      await initialiseSubscriber({ destination: 'new-queue-name' });
      expect(logEvent).toHaveBeenCalledWith(
        'Initialising Subscriber',
        expect.objectContaining({
          queue: expect.objectContaining({
            destination: 'new-queue-name'
          })
        })
      );
      done();
    });

    it('should call logEvent with new ack type when passed in', async done => {
      await initialiseSubscriber({ ack: 'client' });
      expect(logEvent).toHaveBeenCalledWith(
        'Initialising Subscriber',
        expect.objectContaining({
          queue: expect.objectContaining({
            ack: 'client'
          })
        })
      );
      done();
    });
  });

  describe('on success', () => {
    beforeEach(async () => {
      await initialiseSubscriber();
    });

    it('should call logEvent with "Subscribing to MQ"', () => {
      expect(logEvent).toHaveBeenCalledTimes(1);
      expect(logEvent).toHaveBeenCalledWith('Initialising Subscriber', expect.anything());
    });

    it('should call logEvent with the queue name', () => {
      expect(logEvent).toHaveBeenCalledTimes(1);
      expect(logEvent).toHaveBeenCalledWith(
        'Initialising Subscriber',
        expect.objectContaining({
          queue: expect.objectContaining({ destination: mockQueueName })
        })
      );
    });

    it('should call logEvent with queue ack', () => {
      expect(logEvent).toHaveBeenCalledTimes(1);
      expect(logEvent).toHaveBeenCalledWith(
        'Initialising Subscriber',
        expect.objectContaining({
          queue: expect.objectContaining({ ack: 'auto' })
        })
      );
    });

    it('should call channel.subscribe with queueName', () => {
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockChannel.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: mockQueueName
        }),
        expect.any(Function)
      );
    });

    it('should call channel.subscribe with client-individual acknowledgements', () => {
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockChannel.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          ack: 'auto'
        }),
        expect.any(Function)
      );
    });

    it('should call subscriberReadMessageCallback with the mockChannel', () => {
      expect(subscriberReadMessageCallback).toHaveBeenCalledTimes(1);
      expect(subscriberReadMessageCallback).toHaveBeenCalledWith(mockChannel);
    });

    it('should resolve with the client', () => {
      return expect(initialiseSubscriber()).resolves.toEqual(mockChannel);
    });
  });

  describe('on error', () => {
    beforeEach(() => {
      channelPool.channel.mockImplementation(callback => callback(mockError));
    });

    afterEach(() => {
      channelPool.channel.mockImplementation(callback => callback(null, mockChannel));
    });

    it('should call logError with error', async done => {
      await initialiseSubscriber().catch(() => {});

      expect(logError).toHaveBeenCalledTimes(1);
      expect(logError).toHaveBeenCalledWith('initialiseSubscriber error', mockError);

      done();
    });

    it('should reject with the error', () => {
      return expect(initialiseSubscriber()).rejects.toBe(mockError);
    });
  });
});
