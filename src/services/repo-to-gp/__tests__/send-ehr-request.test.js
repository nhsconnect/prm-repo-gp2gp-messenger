import { v4 as uuid } from 'uuid';
import { initialiseConfig } from '../../../config';
import { sendEhrRequest } from '../send-ehr-request';
import nock from 'nock';

jest.mock('../../../config');

describe('sendEhrRequest', () => {
  const conversationId = uuid();
  const nhsNumber = '1234567890';
  const odsCode = 'B12345';
  const body = { nhsNumber, conversationId, odsCode };
  const mockRepoToGpUrl = 'http://localhost';
  const mockRepoToGpAuthKeys = 'fake-keys';
  initialiseConfig.mockReturnValue({
    repoToGpAuthKeys: mockRepoToGpAuthKeys,
    repoToGpUrl: mockRepoToGpUrl
  });

  it('should make a POST request to RepoToGP with conversation id, nhs number and ods code', async () => {
    const headers = { reqheaders: { Authorization: `${mockRepoToGpAuthKeys}` } };
    nock(mockRepoToGpUrl, headers).post(`/registration-requests/`, body).reply(201);
    const sendReq = await sendEhrRequest(nhsNumber, conversationId, odsCode);
    expect(sendReq).toEqual(true);
  });
});
