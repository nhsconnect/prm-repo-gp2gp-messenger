import httpContext from 'async-local-storage';
import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { extractInteractionId } from '../../parser/message';
import { connectToQueue } from '../../queue';
import { getRoutingInformation, sendMessage } from '../mhs-old-queue-test-helper';

httpContext.enable();

jest.mock('../../queue');
jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');
jest.mock('../../parser/message');

const QUEUE_NAME = 'test-queue';

const mockTransaction = {
  send: jest.fn(),
  commit: jest.fn(),
  abort: jest.fn()
};

const client = {
  subscribe: jest.fn(),
  begin: jest.fn(),
  ack: jest.fn(),
  nack: jest.fn(),
  disconnect: jest.fn()
};

const frame = { write: jest.fn(), end: jest.fn() };

describe('mhs-gateway-fake', () => {
  describe('sendMessage', () => {
    beforeEach(() => {
      config.queueName = QUEUE_NAME;

      client.begin.mockReturnValue(mockTransaction);
      mockTransaction.send.mockReturnValue(frame);

      client.ack.mockReturnValue(Promise.resolve());
      client.nack.mockReturnValue(Promise.resolve());

      connectToQueue.mockImplementation(callback => callback(null, client));
    });

    it('should reject when an error has occurred', () => {
      const error = new Error('some-error');

      connectToQueue.mockImplementation(callback => callback(error));

      expect(sendMessage('message')).rejects.toStrictEqual(error);
    });

    it('should update log event when an error has occurred', async () => {
      const error = new Error('some-error');

      connectToQueue.mockImplementation(callback => callback(error));

      await sendMessage('message').catch(() => {});

      expect(connectToQueue).toHaveBeenCalledTimes(1);
      expect(updateLogEvent).toHaveBeenCalledWith({
        mhs: { status: 'connection-failed' }
      });
    });

    it('should put response on queue once when ehr request sent', () => {
      const requestEhrRequest = 'RCMR_IN010000UK05';

      extractInteractionId.mockReturnValue(requestEhrRequest);

      return sendMessage('message').then(() => {
        expect(updateLogEvent).toHaveBeenCalledWith({
          mhs: { interactionId: requestEhrRequest }
        });
        expect(frame.write).toHaveBeenCalledTimes(1);
        expect(frame.end).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
        return expect(mockTransaction.send).toHaveBeenCalledWith({ destination: config.queueName });
      });
    });

    it('should not put fragment on queue if message is not RCMR_IN010000UK05', async done => {
      const interactionId = 'FAKE_IN010000UK05';
      extractInteractionId.mockReturnValue(interactionId);
      await sendMessage('<FAKE_IN010000UK05></FAKE_IN010000UK05>');
      expect(updateLogEvent).toHaveBeenCalledWith({
        mhs: { interactionId }
      });
      expect(frame.write).toHaveBeenCalledTimes(0);
      expect(frame.end).toHaveBeenCalledTimes(0);
      expect(mockTransaction.commit).toHaveBeenCalledTimes(0);
      done();
    });
  });

  describe('getRoutingInformation', () => {
    it('should return the ods code with aisd prefixed', () => {
      const testOdsCode = 'test-ods';

      const expectedResult = {
        asid: 'asid-' + testOdsCode
      };

      return getRoutingInformation(testOdsCode).then(result => {
        return expect(result).toStrictEqual(expectedResult);
      });
    });
  });
});
