import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { initializeConfig } from '../../../config';
import { sendEhrMessageReceived } from '../send-ehr-message-received';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging');

describe('sendEhrMessageReceived', () => {
  const conversationId = uuid();
  const messageId = uuid();
  const mockGpToRepoUrl = 'fake-url';
  const mockGpToRepoAuthKeys = 'fake-keys';
  initializeConfig.mockReturnValue({ gpToRepoAuthKeys: 'fake-keys', gpToRepoUrl: 'fake-url' });

  it('should make a PATCH request to GPToRepo with conversation id and message id', async () => {
    const axiosHeaders = { headers: { Authorization: `${mockGpToRepoAuthKeys}` } };
    await sendEhrMessageReceived(conversationId, messageId);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${mockGpToRepoUrl}/deduction-requests/${conversationId}/ehr-message-received`,
      { messageId },
      axiosHeaders
    );
  });

  it('should throw 503 with axios.patch request', () => {
    axios.patch.mockRejectedValue({ response: { status: 503 } });
    return expect(sendEhrMessageReceived(conversationId, messageId)).rejects.toThrowError(
      `PATCH ${mockGpToRepoUrl}/deduction-requests/${conversationId}/ehr-message-received - Request failed`
    );
  });
});
