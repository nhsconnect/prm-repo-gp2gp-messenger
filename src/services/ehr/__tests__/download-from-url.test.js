import nock from 'nock';
import { downloadFromUrl } from '../download-from-url';
import { logError, logInfo } from '../../../middleware/logging';

jest.mock('../../../middleware/logging');

describe('downloadFromUrl', () => {
  const host = 'http://localhost';
  const ehrUrl = `${host}/conversationId/messageId`;

  it('should make a GET request to retrieve ehr extract from repo', async () => {
    const expectedEhrExtract = 'content of the ehr extract';

    nock(host).get('/conversationId/messageId').reply(200, expectedEhrExtract);
    const ehrExtract = await downloadFromUrl(ehrUrl, 'EHR core from repo');

    expect(ehrExtract).toEqual(expectedEhrExtract);
    expect(logInfo).toHaveBeenCalledWith('Successfully retrieved EHR core from repo');
  });

  it('should log and throw error when axios returns 503', async () => {
    const expectedError = new Error('Request failed with status code 503');
    nock(host).get('/conversationId/messageId').reply(503);

    let error = null;
    try {
      await downloadFromUrl(ehrUrl, 'EHR fragment from repo');
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(logError).toHaveBeenCalledWith(`Cannot retrieve EHR fragment from repo`, expectedError);
  });
});
