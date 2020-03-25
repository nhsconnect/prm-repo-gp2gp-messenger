import axios from 'axios';
import axiosRetry from 'axios-retry';
import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { setTransferComplete } from '../set-ehr-repo-transfer-complete';

jest.mock('axios');
jest.mock('axios-retry');
jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn(),
  eventFinished: jest.fn()
}));

axiosRetry.mockImplementation(() => jest.fn());

const originalEhrRepoUrl = config.ehrRepoUrl;

describe('setTransferComplete', () => {
  const conversationId = 'some-conversation-id';
  const messageId = 'some-message-id';

  beforeEach(() => {
    config.ehrRepoUrl = 'https://ehr-repo-url';
    axios.patch.mockResolvedValue({ data: 'some-url' });
  });

  afterEach(() => {
    config.ehrRepoUrl = originalEhrRepoUrl;
  });

  it('should make a call to ehr storage endpoint with conversation ID and message', async done => {
    await setTransferComplete(conversationId, messageId);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${config.ehrRepoUrl}/health-record/${conversationId}/message/${messageId}`,
      expect.objectContaining({
        transferComplete: true
      })
    );
    done();
  });

  it('should throw an error if axios.patch throws', () => {
    axios.patch.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(setTransferComplete(conversationId, messageId)).rejects.toEqual(
      Error('some-error')
    );
  });

  it('should call updateLogEvent with the error if axios.patch throws', async done => {
    axios.patch.mockImplementation(() => {
      throw new Error('some-error');
    });
    await setTransferComplete(conversationId, messageId).catch(() => {});
    expect(updateLogEvent).toHaveBeenCalledTimes(1);
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed to update transfer complete to ehr repo api',
        error: expect.anything()
      })
    );
    done();
  });
});
