import httpContext from 'async-local-storage';
import config from '../../../config';
import { connectToQueue } from '../../../config/queue';
import { getRoutingInformation, sendMessage } from '../mhs-queue-test-helper';
import { updateLogEvent } from '../../../middleware/logging';
import { extractInteractionId } from '../../message-parser';
import { generateFirstFragmentResponse } from '../../../templates/soap/fragment-1-template';
import { generateSecondFragmentResponse } from '../../../templates/soap/fragment-2-template';
import { generateThirdFragmentResponse } from '../../../templates/soap/fragment-3-template';
import { generateBigFragmentResponse } from '../../../templates/soap/fragment-4-template';
import { generateAcknowledgementResponse } from '../../../templates/soap/ack-template';

httpContext.enable();

jest.mock('../../../config/queue');
jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');
jest.mock('../../message-parser');

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

    it('should reject and update log event when an error has occurred', () => {
      const error = new Error('some-error');

      connectToQueue.mockImplementation(callback => callback(error));

      return sendMessage('message').catch(err => {
        expect(err).toStrictEqual(error);
        expect(connectToQueue).toHaveBeenCalledTimes(1);
        return expect(updateLogEvent).toHaveBeenCalledWith({
          mhs: { status: 'connection-failed' }
        });
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

    it('should put 4 fragments on when continues sent', () => {
      const continueRequest = 'COPC_IN000001UK01';

      extractInteractionId.mockReturnValue(continueRequest);

      return sendMessage('message')
        .then(() => {
          sendMessage('message');
        })
        .then(() => {
          sendMessage('message');
        })
        .then(() => {
          sendMessage('message');
        })
        .then(() => {
          sendMessage('message');
        })
        .then(() => {
          expect(updateLogEvent).toHaveBeenCalledWith({
            mhs: { interactionId: continueRequest }
          });
          expect(frame.write).toHaveBeenCalledTimes(5);
          expect(frame.end).toHaveBeenCalledTimes(5);
          expect(mockTransaction.commit).toHaveBeenCalledTimes(5);
          expect(frame.write).toHaveBeenNthCalledWith(1, generateFirstFragmentResponse());
          expect(frame.write).toHaveBeenNthCalledWith(2, generateSecondFragmentResponse());
          expect(frame.write).toHaveBeenNthCalledWith(3, generateThirdFragmentResponse());
          expect(frame.write).toHaveBeenNthCalledWith(4, generateBigFragmentResponse());
          expect(frame.write).toHaveBeenNthCalledWith(5, generateAcknowledgementResponse());
          expect(mockTransaction.send).toHaveBeenCalledWith({ destination: config.queueName });
        });
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
