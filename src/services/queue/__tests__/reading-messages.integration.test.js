import { v4 as uuid } from 'uuid';
import nock from 'nock';
import httpContext from 'async-local-storage';
import { initialiseSubscriber } from '../subscriber';
import { clearQueue, consumeOneMessage } from '../helper';
import { sendToQueue } from '../publisher';
import {
  conversationId,
  nhsNumber,
  odsCode,
  ehrRequestMessage,
  pdsGeneralUpdateRequestAcceptedMessage,
  ehrRequestId
} from '../subscriber/__tests__/data/subscriber';

httpContext.enable();

jest.mock('../../../middleware/logging');
jest.unmock('stompit');
jest.mock('../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    gpToRepoAuthKeys: 'fake-keys',
    gpToRepoUrl: 'http://localhost',
    repoToGpAuthKeys: 'more-fake-keys',
    repoToGpUrl: 'http://localhost',
    queueUrls: [
      process.env.GP2GP_ADAPTOR_MHS_QUEUE_URL_1,
      process.env.GP2GP_ADAPTOR_MHS_QUEUE_URL_2
    ]
  })
}));

describe('Should read messages from the queue successfully', () => {
  let uniqueQueueName;
  let channel;

  beforeEach(async () => {
    uniqueQueueName = uuid();
    channel = await initialiseSubscriber({ destination: uniqueQueueName });
  });

  afterEach(async () => {
    channel.close();
    await clearQueue({ destination: uniqueQueueName });
  });

  describe('Handle PDS Update successful', () => {
    const mockGpToRepoUrl = 'http://localhost';
    const mockGpToRepoAuthKeys = 'fake-keys';

    it('should tell the GPToRepo that the PDS Update has been successful', async () => {
      const headers = { reqheaders: { Authorization: `${mockGpToRepoAuthKeys}` } };
      const scope = nock(mockGpToRepoUrl, headers)
        .patch(`/deduction-requests/${conversationId}/pds-update`)
        .reply(204);
      await sendToQueue(pdsGeneralUpdateRequestAcceptedMessage, {
        destination: uniqueQueueName
      });
      await consumeOneMessage({ destination: uniqueQueueName });
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('Handle EHR Request', () => {
    const mockRepoToGpUrl = 'http://localhost';
    const mockRepoToGpAuthKeys = 'more-fake-keys';
    it('should tell RepoToGP that an ehr request has been received', async () => {
      const headers = { reqheaders: { Authorization: `${mockRepoToGpAuthKeys}` } };
      const body = {
        data: {
          type: 'registration-requests',
          id: conversationId,
          attributes: {
            nhsNumber,
            odsCode,
            ehrRequestId
          }
        }
      };
      const scope = nock(mockRepoToGpUrl, headers).post(`/registration-requests/`, body).reply(201);

      await sendToQueue(ehrRequestMessage, {
        destination: uniqueQueueName
      });
      await consumeOneMessage({ destination: uniqueQueueName });
      expect(scope.isDone()).toBe(true);
    });
  });
});
