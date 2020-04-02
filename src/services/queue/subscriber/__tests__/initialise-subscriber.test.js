import config from '../../../../config';
import { updateLogEvent, updateLogEventWithError } from '../../../../middleware/logging';
import { mockChannel } from '../../../../__mocks__/stompit';
import { initialiseSubscriber } from '../initialise-subscriber';
import { subscriberReadMessageCallback } from '../subscriber-read-message-callback';
import { channelPool } from '../../helper';

jest.mock('../../../../middleware/logging');
jest.mock('../subscriber-read-message-callback');
jest.mock('../../helper/connect-to-queue');

const originalConfig = { ...config };
const mockQueueName = 'mock-queue';
const mockError = 'mock-error';

describe('initialiseSubscriber', () => {
  describe('configuration', () => {
    beforeEach(async () => {
      config.queueName = mockQueueName;
    });

    afterEach(() => {
      config.queueName = originalConfig.queueName;
    });

    it('should call channel.subscribe with new queueName when passed in, and not override default options', async done => {
      await initialiseSubscriber({ destination: 'new-queue-name' });
      expect(mockChannel.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'new-queue-name',
          ack: 'client-individual'
        }),
        expect.any(Function)
      );
      done();
    });

    it('should call updateLogEvent with new queueName when passed in', async done => {
      await initialiseSubscriber({ destination: 'new-queue-name' });
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: expect.objectContaining({
            destination: 'new-queue-name'
          })
        })
      );
      done();
    });

    it('should call updateLogEvent with new ack type when passed in', async done => {
      await initialiseSubscriber({ ack: 'client' });
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: expect.objectContaining({
            ackType: 'client'
          })
        })
      );
      done();
    });
  });

  describe('on success', () => {
    beforeEach(async () => {
      config.queueName = mockQueueName;
      await initialiseSubscriber();
    });

    afterEach(() => {
      config.queueName = originalConfig.queueName;
    });

    it('should call updateLogEvent with "Subscribing to MQ"', () => {
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Initialising Subscriber'
        })
      );
    });

    it('should call updateLogEvent with the queue name', () => {
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: expect.objectContaining({ name: mockQueueName })
        })
      );
    });

    it('should call updateLogEvent with queue ackType', () => {
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: expect.objectContaining({ ackType: 'client-individual' })
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
          ack: 'client-individual'
        }),
        expect.any(Function)
      );
    });

    it('should call subscriberReadMessageCallback with the mockClient', () => {
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

    it('should call updateLogEventWithError with error', async done => {
      await initialiseSubscriber().catch(() => {});

      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(mockError);

      done();
    });

    it('should reject with the error', () => {
      return expect(initialiseSubscriber()).rejects.toBe(mockError);
    });
  });
});
