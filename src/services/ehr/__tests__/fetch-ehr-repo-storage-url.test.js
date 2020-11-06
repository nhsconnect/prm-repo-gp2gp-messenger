import axios from 'axios';
import { initialiseConfig } from '../../../config';
import { eventFinished, updateLogEvent } from '../../../middleware/logging';
import { fetchStorageUrl } from '../fetch-ehr-repo-storage-url';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn(),
  eventFinished: jest.fn()
}));

describe('fetchStorageUrl', () => {
  const body = 'some-request-body';
  const mockEhrRepoUrl = 'https://ehr-repo-url';
  initialiseConfig.mockReturnValue({ ehrRepoUrl: mockEhrRepoUrl });

  beforeEach(() => {
    axios.post.mockResolvedValue({ data: 'some-url' });
  });

  it('should make a call fetch url with soap message as body', async done => {
    await fetchStorageUrl(body);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${mockEhrRepoUrl}/fragments`, body);
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
    expect(updateLogEvent).toHaveBeenCalledTimes(1);
    expect(updateLogEvent).toHaveBeenCalledWith(
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
