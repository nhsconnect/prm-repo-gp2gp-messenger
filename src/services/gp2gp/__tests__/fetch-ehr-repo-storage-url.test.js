import axios from 'axios';
import config from '../../../config';
import { eventFinished, updateLogEvent } from '../../../middleware/logging';
import { fetchStorageUrl } from '../fetch-ehr-repo-storage-url';

jest.mock('axios');
jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn(),
  eventFinished: jest.fn()
}));

const originalEhrRepoUrl = config.ehrRepoUrl;

describe('fetchStorageUrl', () => {
  const message = 'some-message';
  const conversationId = 'some-conversation-id';

  beforeEach(() => {
    config.ehrRepoUrl = 'https://ehr-repo-url';
    axios.post.mockResolvedValue({ data: 'some-url' });
  });

  afterEach(() => {
    config.ehrRepoUrl = originalEhrRepoUrl;
  });

  it('should make a call fetch url with conversation ID and message', async done => {
    await fetchStorageUrl(conversationId, message);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${config.ehrRepoUrl}/health-record/${conversationId}/new/message`,
      message
    );
    done();
  });

  it('should call eventFinished', async done => {
    await fetchStorageUrl(conversationId, message);
    expect(eventFinished).toHaveBeenCalledTimes(1);
    done();
  });

  it('should throw an error if axios.post throws', () => {
    axios.post.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(fetchStorageUrl(conversationId, message)).rejects.toEqual(Error('some-error'));
  });

  it('should call updateLogEvent with the error if axios.post throws', async done => {
    axios.post.mockImplementation(() => {
      throw new Error('some-error');
    });
    await fetchStorageUrl(conversationId, message).catch(() => {});
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
    await fetchStorageUrl(conversationId, message).catch(() => {});
    expect(eventFinished).toHaveBeenCalledTimes(1);
    done();
  });
});
