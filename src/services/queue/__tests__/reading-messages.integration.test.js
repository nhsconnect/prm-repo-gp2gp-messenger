import { v4 as uuid } from 'uuid';
import { initialiseSubscriber } from '../subscriber';
import { clearQueue, consumeOneMessage } from '../helper';
import { sendToQueue } from '../publisher';
import {
  conversationId,
  pdsGeneralUpdateRequestAcceptedMessage
} from '../subscriber/__tests__/data/subscriber';
import axios from 'axios';
import config from '../../../config';
import httpContext from 'async-local-storage';

httpContext.enable();

jest.unmock('stompit');
jest.mock('axios');

describe('Handle PDS Update successful', () => {
  let uniqueQueueName;
  let channel;

  const originalGpToRepoAuthKeys = config.gpToRepoAuthKeys;
  const originalGpToRepoUrl = config.gpToRepoUrl;

  beforeEach(async () => {
    uniqueQueueName = uuid();
    channel = await initialiseSubscriber({ destination: uniqueQueueName });
    axios.patch.mockResolvedValue({ status: 204 });
    config.gpToRepoAuthKeys = 'fake-keys';
    config.gpToRepoUrl = 'fake-url';
  });

  afterEach(async () => {
    channel.close();
    await clearQueue({ destination: uniqueQueueName });
    config.gpToRepoAuthKeys = originalGpToRepoAuthKeys;
    config.gpToRepoUrl = originalGpToRepoUrl;
  });

  it('should tell the GPToRepo that the PDS Update has been successful', async () => {
    await sendToQueue(pdsGeneralUpdateRequestAcceptedMessage, {
      destination: uniqueQueueName
    });
    await consumeOneMessage({ destination: uniqueQueueName });

    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${config.gpToRepoUrl}/deduction-requests/${conversationId}/pds-update`,
      {},
      { headers: { Authorization: `${config.gpToRepoAuthKeys}` } }
    );
  });
});
