import config from '../../../../config';
import { updateLogEvent, updateLogEventWithError } from '../../../../middleware/logging';
import { mockClient } from '../../../../__mocks__/stompit';
import { connectToQueue } from '../../helper/connect-to-queue';
import { initialiseSubscriber } from '../initialise-subscriber';
import { subscriberReadMessageCallback } from '../subscriber-read-message-callback';

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

    it('should call client.subscribe with new queueName when passed in, and ack: "client-individual"', async done => {
      await initialiseSubscriber({ destination: 'new-queue-name' });
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'new-queue-name',
          ack: 'client-individual'
        }),
        expect.any(Function)
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

    it('should call client.subscribe with queueName', () => {
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: mockQueueName
        }),
        expect.any(Function)
      );
    });

    it('should call client.subscribe with client-individual acknowledgements', () => {
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          ack: 'client-individual'
        }),
        expect.any(Function)
      );
    });

    it('should call subscriberReadMessageCallback with the mockClient', () => {
      expect(subscriberReadMessageCallback).toHaveBeenCalledTimes(1);
      expect(subscriberReadMessageCallback).toHaveBeenCalledWith(mockClient);
    });

    it('should resolve with the client', () => {
      return expect(initialiseSubscriber()).resolves.toEqual(mockClient);
    });
  });

  describe('on error', () => {
    beforeEach(() => {
      connectToQueue.mockImplementation(callback => callback(mockError, mockClient));
    });

    it('should call connect to queue', async done => {
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
