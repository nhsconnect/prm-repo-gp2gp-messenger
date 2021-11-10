import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import { config } from '../config';

const TIMEOUT_30_S = 30000;

describe('POST /health-record-requests/:nhsNumber', () => {
  let test_fn = it;
  if (config.nhsEnvironment === 'prod') {
    test_fn = it.skip;
  }
  test_fn(
    'should test successful POST request for /health-record-requests/:nhsNumber with Authorization',
    () => {
      const testData = {
        dev: {
          nhsNumber: 9692842339
        },
        test: {
          nhsNumber: 9692295621
        },
        'pre-prod': {
          nhsNumber: 9693642112
        }
      };

      const { nhsNumber } = testData[config.nhsEnvironment];

      const body = {
        repositoryOdsCode: 'B86041',
        repositoryAsid: '200000001161',
        practiceOdsCode: 'M85019',
        conversationId: '2d8ac681-0721-4d0c-8b76-5a26987829fb'
      };

      return expect(
        axios.post(`${config.gp2gpAdaptorUrl}/health-record-requests/${nhsNumber}`, body, {
          headers: {
            Authorization: config.e2eTestAuthorizationKeysForGp2gpAdaptor
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
