import httpContext from 'async-local-storage';
import { initialiseConsumer } from '../consumer';
import { EHRRequestCompleted } from '../gp2gp/ehr-request-completed';
import { clearQueue, sendToQueue } from '../mhs/mhs-queue-test-queue-publisher';
import { consumeOneMessage } from '../mhs/mhs-queue-test-queue-consumer';
import { PDSGeneralUpdateRequestAccepted } from '../pds/pds-general-update-request-accepted';
import { ehrRequestCompletedMessage } from './data/consumer';

httpContext.enable();
jest.unmock('stompit');
jest.mock('../gp2gp/ehr-request-completed');
jest.mock('../pds/pds-general-update-request-accepted');
jest.mock('../../middleware/logging');

describe('initialiseConsumer', () => {
  let client;

  const mockEhrHandleMessage = jest
    .fn()
    .mockImplementation(() => 'EHRRequestCompleted handled message');

  beforeEach(async () => {
    EHRRequestCompleted.prototype.handleMessage = mockEhrHandleMessage;

    PDSGeneralUpdateRequestAccepted.prototype.handleMessage = jest
      .fn()
      .mockImplementation(() => 'PDSGeneralUpdateRequestAccepted handled message');

    client = await initialiseConsumer();
  });

  afterEach(async () => {
    client.destroy();
    await clearQueue();
  });

  describe('when RCMR_IN030000UK06 (EHR Request Completed) Message is put on the queue', () => {
    it('should consume the message off the queue', async done => {
      await sendToQueue(ehrRequestCompletedMessage);
      const message = await consumeOneMessage();
      expect(message).toEqual({});
      done();
    });

    it('should call EHRRequestCompleted.handleMessage()', async done => {
      await sendToQueue(ehrRequestCompletedMessage);
      // Below needed to wait for message to be consumed
      await consumeOneMessage();
      expect(mockEhrHandleMessage).toHaveBeenCalledTimes(1);
      expect(mockEhrHandleMessage).toHaveBeenCalledWith(ehrRequestCompletedMessage);

      done();
    });
  });
});
