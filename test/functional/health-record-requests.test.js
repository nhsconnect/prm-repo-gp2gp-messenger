import axios from 'axios';
import adapter from 'axios/lib/adapters/http';

describe('POST /health-record-requests/:nhsNumber', () => {
  it('should test successful POST request for /health-record-requests/:nhsNumber with Authorization', () => {
    const nhsNumber = process.env.NHS_ENVIRONMENT === 'dev' ? '9473480032' : '9442964410';

    const body = {
      repositoryOdsCode: 'B86041',
      repositoryAsid: '200000001161',
      practiceOdsCode: 'M85019',
      practiceAsid: '200000000149',
      conversationId: '2d8ac681-0721-4d0c-8b76-5a26987829fb'
    };

    return expect(
      axios.post(`${process.env.SERVICE_URL}/health-record-requests/${nhsNumber}`, body, {
        headers: {
          Authorization: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS
        },
        adapter
      })
    ).resolves.toEqual(
      expect.objectContaining({
        status: 204
      })
    );
  });
});
