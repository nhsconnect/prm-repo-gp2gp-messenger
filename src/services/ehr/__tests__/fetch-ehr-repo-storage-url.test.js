import axios from 'axios';
import { v4 } from 'uuid';
import { initializeConfig } from '../../../config';
import { logError } from '../../../middleware/logging';
import { fetchStorageUrl } from '../fetch-ehr-repo-storage-url';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging');

describe('fetchStorageUrl', () => {
  const conversationId = v4();
  const body = { conversationId };
  const mockEhrRepoUrl = 'https://ehr-repo-url';
  const mockAuthKeys = 'auth';
  initializeConfig.mockReturnValue({ ehrRepoUrl: mockEhrRepoUrl, ehrRepoAuthKeys: mockAuthKeys });
  const axiosConfig = { headers: { Authorization: mockAuthKeys } };

  beforeEach(() => {
    axios.post.mockResolvedValue({ data: 'some-url' });
  });

  it('should make a call fetch url with soap message and isLargeMessage', async done => {
    await fetchStorageUrl(body);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${mockEhrRepoUrl}/fragments`,
      expect.objectContaining({
        isLargeMessage: false
      }),
      axiosConfig
    );
    done();
  });

  it('should throw an error if axios.post throws', () => {
    axios.post.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(fetchStorageUrl(body)).rejects.toEqual(Error('some-error'));
  });

  it('should call logError if axios.post throws', async done => {
    axios.post.mockImplementation(() => {
      throw new Error('some-error');
    });
    await fetchStorageUrl(body).catch(() => {});
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith('failed to get pre-signed url', expect.anything());
    done();
  });
});
