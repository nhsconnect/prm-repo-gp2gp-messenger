import httpContext from 'async-local-storage';
import { v4 as uuid } from 'uuid';
import { initialiseSubscriber } from '../';
import { clearQueue, consumeOneMessage, sendToQueue } from '../../';
import { EHRRequestCompleted } from '../../../gp2gp/ehr-request-completed';
import { PDSGeneralUpdateRequestAccepted } from '../../../pds/pds-general-update-request-accepted';
import {
  ehrRequestCompletedMessage,
  pdsGeneralUpdateRequestAcceptedMessage,
  unhandledInteractionId
} from './data/subscriber';

httpContext.enable();

jest.unmock('stompit');
jest.unmock('uuid');
jest.mock('../../../gp2gp/ehr-request-completed');
jest.mock('../../../pds/pds-general-update-request-accepted');
jest.mock('../../../../middleware/logging');

describe('initialiseConsumer', () => {
  let uniqueQueueName;
  let channel;

  const mockEhrHandleMessage = jest
    .fn()
    .mockImplementation(() => 'EHRRequestCompleted handled message');
  const mockPdsHandleMessage = jest
    .fn()
    .mockImplementation(() => 'PDSGeneralUpdateRequestAccepted handled message');

  beforeEach(async () => {
    EHRRequestCompleted.prototype.handleMessage = mockEhrHandleMessage;
    PDSGeneralUpdateRequestAccepted.prototype.handleMessage = mockPdsHandleMessage;

    uniqueQueueName = uuid();
    channel = await initialiseSubscriber({ destination: uniqueQueueName });
  });

  afterEach(async () => {
    channel.close();
    await clearQueue({ destination: uniqueQueueName });
  });

  describe('when RCMR_IN030000UK06 (EHR Request Completed) Message is put on the queue', () => {
    it('should consume the message off the queue', async done => {
      await sendToQueue(ehrRequestCompletedMessage, {
        destination: uniqueQueueName
      });
      const message = await consumeOneMessage({ destination: uniqueQueueName });
      setImmediate(() => {
        expect(message).toEqual({});
        done();
      });
    });

    it('should call EHRRequestCompleted.handleMessage()', async done => {
      await sendToQueue(ehrRequestCompletedMessage, { destination: uniqueQueueName });
      // Below needed to wait for message to be consumed
      await consumeOneMessage({ destination: uniqueQueueName });
      expect(mockEhrHandleMessage).toHaveBeenCalledTimes(1);
      expect(mockEhrHandleMessage).toHaveBeenCalledWith(ehrRequestCompletedMessage);
      done();
    });
  });

  describe('when PRPA_IN000202UK01 (PDS General Update Request Accepted) Message is put on the queue', () => {
    it('should consume the message off the queue', async done => {
      await sendToQueue(pdsGeneralUpdateRequestAcceptedMessage, {
        destination: uniqueQueueName
      });
      const message = await consumeOneMessage({ destination: uniqueQueueName });
      setImmediate(() => {
        expect(message).toEqual({});
        done();
      });
    });

    it('should call PDSGeneralUpdateRequestAccepted.handleMessage()', async done => {
      await sendToQueue(pdsGeneralUpdateRequestAcceptedMessage, {
        destination: uniqueQueueName
      });
      // Below needed to wait for message to be consumed
      await consumeOneMessage({ destination: uniqueQueueName });
      expect(mockPdsHandleMessage).toHaveBeenCalledTimes(1);
      expect(mockPdsHandleMessage).toHaveBeenCalledWith(pdsGeneralUpdateRequestAcceptedMessage);
      done();
    });
  });

  describe('when unhandled Interaction ID Message is put on the queue', () => {
    it('should consume the message off the queue (or else infinite loop)', async done => {
      await sendToQueue(unhandledInteractionId, { destination: uniqueQueueName });
      const message = await consumeOneMessage({ destination: uniqueQueueName });
      setImmediate(() => {
        expect(message).toEqual({});
        done();
      });
    });

    it('should not call PDSGeneralUpdateRequestAccepted.handleMessage() or EHRRequestCompleted.handleMessage()', async done => {
      await sendToQueue(unhandledInteractionId, { destination: uniqueQueueName });
      // Below needed to wait for message to be consumed
      await consumeOneMessage({ destination: uniqueQueueName });
      expect(mockEhrHandleMessage).toHaveBeenCalledTimes(0);
      expect(mockPdsHandleMessage).toHaveBeenCalledTimes(0);
      done();
    });
  });
});
