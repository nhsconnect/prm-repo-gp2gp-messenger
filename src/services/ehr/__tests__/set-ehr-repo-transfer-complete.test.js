import axios from 'axios';
import { initializeConfig } from '../../../config';
import { logError } from '../../../middleware/logging';
import { setTransferComplete } from '../set-ehr-repo-transfer-complete';
import { v4 } from 'uuid';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging');

describe('setTransferComplete', () => {
  const conversationId = v4();
  const body = { conversationId };
  const mockEhrRepoUrl = 'https://ehr-repo-url';
  const mockAuthKeys = 'auth';
  initializeConfig.mockReturnValue({ ehrRepoUrl: mockEhrRepoUrl, ehrRepoAuthKeys: mockAuthKeys });
  const axiosConfig = { headers: { Authorization: mockAuthKeys } };

  beforeEach(() => {
    axios.patch.mockResolvedValue({ data: 'some-url' });
  });

  it('should make a call to ehr storage endpoint with conversation ID and message', async done => {
    await setTransferComplete(body);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${mockEhrRepoUrl}/fragments`,
      expect.objectContaining({
        conversationId,
        transferComplete: true
      }),
      axiosConfig
    );
    done();
  });

  it('should throw an error if axios.patch throws', () => {
    axios.patch.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(setTransferComplete(body)).rejects.toEqual(Error('some-error'));
  });

  it('should call logError with the error if axios.patch throws', async done => {
    axios.patch.mockImplementation(() => {
      throw new Error('some-error');
    });
    await setTransferComplete(body).catch(() => {});
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      'failed to update transfer complete to ehr repo api',
      expect.anything()
    );
    done();
  });
});
