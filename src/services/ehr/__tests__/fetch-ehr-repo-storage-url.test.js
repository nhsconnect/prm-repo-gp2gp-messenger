import axios from 'axios';
import { v4 } from 'uuid';
import { initialiseConfig } from '../../../config';
import { eventFinished, updateLogEventWithError } from '../../../middleware/logging';
import { fetchStorageUrl } from '../fetch-ehr-repo-storage-url';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging', () => ({
  updateLogEventWithError: jest.fn(),
  eventFinished: jest.fn()
}));

describe('fetchStorageUrl', () => {
  const conversationId = v4();
  const body = { conversationId };
  const mockEhrRepoUrl = 'https://ehr-repo-url';
  const mockAuthKeys = 'auth';
  initialiseConfig.mockReturnValue({ ehrRepoUrl: mockEhrRepoUrl, ehrRepoAuthKeys: mockAuthKeys });
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

  it('should call eventFinished', async done => {
    await fetchStorageUrl(body);
    expect(eventFinished).toHaveBeenCalledTimes(1);
    done();
  });

  it('should throw an error if axios.post throws', () => {
    axios.post.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(fetchStorageUrl(body)).rejects.toEqual(Error('some-error'));
  });

  it('should call updateLogEvent with the error if axios.post throws', async done => {
    axios.post.mockImplementation(() => {
      throw new Error('some-error');
    });
    await fetchStorageUrl(body).catch(() => {});
    expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
    expect(updateLogEventWithError).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed to get pre-signed url',
        error: expect.anything()
      })
    );
    done();
  });

  it('should call eventFinished if axios.post throws', async done => {
    axios.post.mockImplementation(() => {
      throw new Error('some-error');
    });
    await fetchStorageUrl(body).catch(() => {});
    expect(eventFinished).toHaveBeenCalledTimes(1);
    done();
  });
});
