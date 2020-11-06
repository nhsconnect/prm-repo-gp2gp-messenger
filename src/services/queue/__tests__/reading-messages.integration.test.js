import { v4 as uuid } from 'uuid';
import axios from 'axios';
import httpContext from 'async-local-storage';
import { initialiseSubscriber } from '../subscriber';
import { clearQueue, consumeOneMessage } from '../helper';
import { sendToQueue } from '../publisher';
import {
  conversationId,
  pdsGeneralUpdateRequestAcceptedMessage
} from '../subscriber/__tests__/data/subscriber';

httpContext.enable();

jest.unmock('stompit');
jest.mock('axios');
jest.mock('../../../config', () => ({
  initialiseConfig: jest.fn().mockReturnValue({
    gpToRepoAuthKeys: 'fake-keys',
    gpToRepoUrl: 'fake-url',
    queueUrls: [
      process.env.GP2GP_ADAPTOR_MHS_QUEUE_URL_1,
      process.env.GP2GP_ADAPTOR_MHS_QUEUE_URL_2
    ]
  })
}));

describe('Handle PDS Update successful', () => {
  let uniqueQueueName;
  let channel;
  const mockGpToRepoUrl = 'fake-url';
  const mockGpToRepoAuthKeys = 'fake-keys';

  beforeEach(async () => {
    uniqueQueueName = uuid();
    channel = await initialiseSubscriber({ destination: uniqueQueueName });
    axios.patch.mockResolvedValue({ status: 204 });
  });

  afterEach(async () => {
    channel.close();
    await clearQueue({ destination: uniqueQueueName });
  });

  it('should tell the GPToRepo that the PDS Update has been successful', async () => {
    await sendToQueue(pdsGeneralUpdateRequestAcceptedMessage, {
      destination: uniqueQueueName
    });
    await consumeOneMessage({ destination: uniqueQueueName });

    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${mockGpToRepoUrl}/deduction-requests/${conversationId}/pds-update`,
      {},
      { headers: { Authorization: `${mockGpToRepoAuthKeys}` } }
    );
  });
});
