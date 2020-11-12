import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { initialiseConfig } from '../../../config';
import { sendEhrMessageReceived } from '../send-ehr-message-received';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging');

describe('sendEhrMessageReceived', () => {
  const conversationId = uuid();
  const mockGpToRepoUrl = 'fake-url';
  const mockGpToRepoAuthKeys = 'fake-keys';
  initialiseConfig.mockReturnValue({ gpToRepoAuthKeys: 'fake-keys', gpToRepoUrl: 'fake-url' });

  it('should make a PATCH request to GPToRepo with conversation ID', async done => {
    const axiosHeaders = { headers: { Authorization: `${mockGpToRepoAuthKeys}` } };
    await sendEhrMessageReceived(conversationId);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${mockGpToRepoUrl}/deduction-requests/${conversationId}/ehr-message-received`,
      {},
      axiosHeaders
    );
    done();
  });

  it('should throw 503 with axios.patch request', () => {
    axios.patch.mockRejectedValue({ response: { status: 503 } });
    return expect(sendEhrMessageReceived(conversationId)).rejects.toThrowError(
      `PATCH ${mockGpToRepoUrl}/deduction-requests/${conversationId}/ehr-message-received - Request failed`
    );
  });
});
