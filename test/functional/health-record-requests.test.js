import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import { config } from '../config';

const TIMEOUT_30_S = 30000;

describe('POST /health-record-requests/:nhsNumber', () => {
  it(
    'should test successful POST request for /health-record-requests/:nhsNumber with Authorization',
    () => {
      const nhsNumber = process.env.NHS_ENVIRONMENT === 'dev' ? '9692842339' : '9692295621';

      const body = {
        repositoryOdsCode: 'B86041',
        repositoryAsid: '200000001161',
        practiceOdsCode: 'M85019',
        conversationId: '2d8ac681-0721-4d0c-8b76-5a26987829fb'
      };

      return expect(
        axios.post(`${config.gp2gpAdaptorUrl}/health-record-requests/${nhsNumber}`, body, {
          headers: {
            Authorization: config.gp2gpAdaptorAuthorizationKeys
          },
          adapter
        })
      ).resolves.toEqual(
        expect.objectContaining({
          status: 204
        })
      );
    },
    TIMEOUT_30_S
  );
});
