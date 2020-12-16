import axios from 'axios';
import { initializeConfig } from '../../../config';
import { sendPdsUpdate } from '../';

jest.mock('axios');
jest.mock('../../../middleware/logging');
jest.mock('../../../config');

describe('sendPdsUpdate', () => {
  const conversationId = '31079679-ef31-4d97-af0d-d1fda73cd8a5';
  const mockGpToRepoUrl = 'fake-url';
  const mockGpToRepoAuthKeys = 'fake-keys';
  initializeConfig.mockReturnValue({ gpToRepoAuthKeys: 'fake-keys', gpToRepoUrl: 'fake-url' });

  beforeEach(() => {
    axios.patch.mockResolvedValue({ status: 204 });
  });

  it('should make a PATCH request to GPToRepo with conversation ID', async done => {
    const axiosHeaders = { headers: { Authorization: `${mockGpToRepoAuthKeys}` } };
    await sendPdsUpdate(conversationId);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${mockGpToRepoUrl}/deduction-requests/${conversationId}/pds-update`,
      {},
      axiosHeaders
    );
    done();
  });

  it('should throw an error if axios.patch throws', () => {
    axios.patch.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(sendPdsUpdate(conversationId)).rejects.toEqual(Error('some-error'));
  });
});
