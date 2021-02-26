import nock from 'nock';
import { retrieveEhrFromRepo } from '../retrieve-ehr-from-repo';
import { logError, logInfo } from '../../../middleware/logging';

jest.mock('../../../middleware/logging');

describe('retrieveEhrFromRepo', () => {
  const host = 'http://localhost';
  const ehrUrl = `${host}/conversationId/messageId`;

  it('should make a GET request to retrieve ehr extract from repo', async () => {
    const expectedEhrExtract = 'content of the ehr extract';

    nock(host).get('/conversationId/messageId').reply(200, expectedEhrExtract);
    const ehrExtract = await retrieveEhrFromRepo(ehrUrl);

    expect(ehrExtract).toEqual(expectedEhrExtract);
    expect(logInfo).toHaveBeenCalledWith('Successfully retrieved EHR from repo');
  });

  it('should log and throw error when axios returns 503', async () => {
    const expectedError = new Error('Request failed with status code 503');
    nock(host).get('/conversationId/messageId').reply(503);

    let error = null;
    try {
      await retrieveEhrFromRepo(ehrUrl);
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(logError).toHaveBeenCalledWith(`Cannot retrieve EHR extract from repo`, expectedError);
  });
});
