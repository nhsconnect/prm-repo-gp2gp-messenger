import axios from 'axios';
import config from '../../../config';
import { eventFinished, updateLogEvent } from '../../../middleware/logging';
import { putMessageInEhrRepo } from '../put-message-in-ehr-repo';

jest.mock('axios');

jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn(),
  eventFinished: jest.fn()
}));

const originalEhrRepoUrl = config.ehrRepoUrl;

describe('putMessageInEhrRepo', () => {
  const message = 'some-message';
  const url = 'https://s3-upload-url';

  beforeEach(() => {
    config.ehrRepoUrl = 'https://ehr-repo-url';
    axios.put.mockResolvedValue({ status: 200, statusText: 'status-text' });
  });

  afterEach(() => {
    config.ehrRepoUrl = originalEhrRepoUrl;
  });

  it('should make a call to specified url with conversation ID and message', async done => {
    await putMessageInEhrRepo(url, message);
    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(axios.put).toHaveBeenCalledWith(url, message);
    done();
  });

  it('should call updateLogEvent with response details', async done => {
    await putMessageInEhrRepo(url, message);
    expect(updateLogEvent).toHaveBeenCalledTimes(1);
    expect(updateLogEvent).toHaveBeenCalledWith({
      ehrRepository: expect.objectContaining({ responseCode: 200, responseMessage: 'status-text' })
    });
    done();
  });

  it('should call eventFinished', async done => {
    await putMessageInEhrRepo(url, message);
    expect(eventFinished).toHaveBeenCalledTimes(1);
    done();
  });

  it('should throw an error if axios.put throws', () => {
    axios.put.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(putMessageInEhrRepo(url, message)).rejects.toEqual(Error('some-error'));
  });

  it('should call updateLogEvent with the error if axios.put throws', async done => {
    axios.put.mockImplementation(() => {
      throw new Error('some-error');
    });
    await putMessageInEhrRepo(url, message).catch(() => {});
    expect(updateLogEvent).toHaveBeenCalledTimes(1);
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed to store message to s3 via pre-signed url',
        error: expect.anything()
      })
    );
    done();
  });

  it('should call eventFinished if axios.put throws', async done => {
    axios.put.mockImplementation(() => {
      throw new Error('some-error');
    });
    await putMessageInEhrRepo(url, message).catch(() => {});
    expect(eventFinished).toHaveBeenCalledTimes(1);
    done();
  });
});
