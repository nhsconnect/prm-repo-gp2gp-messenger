import axios from 'axios';
import { initializeConfig } from '../../../config';
import { logEvent, logError } from '../../../middleware/logging';
import { putMessageInEhrRepo } from '../put-message-in-ehr-repo';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging');

describe('putMessageInEhrRepo', () => {
  const message = 'some-message';
  const url = 'https://s3-upload-url';
  const mockEhrRepoUrl = 'https://ehr-repo-url';
  initializeConfig.mockReturnValue({ ehrRepoUrl: mockEhrRepoUrl });

  beforeEach(() => {
    axios.put.mockResolvedValue({ status: 200, statusText: 'status-text' });
  });

  it('should make a call to specified url with conversation ID and message', async done => {
    await putMessageInEhrRepo(url, message);
    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(axios.put).toHaveBeenCalledWith(url, message);
    done();
  });

  it('should call logEvent with response details', async done => {
    await putMessageInEhrRepo(url, message);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith('putMessageInEhrRepo success', {
      ehrRepository: expect.objectContaining({ responseCode: 200, responseMessage: 'status-text' })
    });
    done();
  });

  it('should throw an error if axios.put throws', () => {
    axios.put.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(putMessageInEhrRepo(url, message)).rejects.toEqual(Error('some-error'));
  });

  it('should call logError with the error if axios.put throws', async done => {
    axios.put.mockImplementation(() => {
      throw new Error('some-error');
    });
    await putMessageInEhrRepo(url, message).catch(() => {});
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      'failed to store message to s3 via pre-signed url',
      expect.anything()
    );
    done();
  });
});
