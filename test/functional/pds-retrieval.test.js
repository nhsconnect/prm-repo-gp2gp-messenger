import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import testData from '../../src/templates/__tests__/testData.json';
import { config } from '../config';

const TIMEOUT_30_S = 30000;
describe('End to end test of /patient-demographics/:nhsNumber', () => {
  it(
    'should return a 200 from PDS (successful retrieval) with a valid NHS number',
    () => {
      const nhsNumber =
        process.env.NHS_ENVIRONMENT === 'dev'
          ? testData.patient.openTest.nhsNumber
          : testData.tppPatient.nhsNumber;

      return expect(
        axios.get(`${config.gp2gpAdaptorUrl}/patient-demographics/${nhsNumber}`, {
          headers: {
            Authorization: config.gp2gpAdaptorAuthorizationKeys
          },
          adapter
        })
      ).resolves.toEqual(
        expect.objectContaining({
          status: 200
        })
      );
    },
    TIMEOUT_30_S
  );

  it(
    'should return 503 from PDS if the nhs number is not exist',
    () => {
      const fakeNhsNumber = '0000000000';

      return expect(
        axios.get(`${config.gp2gpAdaptorUrl}/patient-demographics/${fakeNhsNumber}`, {
          headers: {
            Authorization: config.e2eTestAuthorizationKeysForGp2gpAdaptor
          },
          adapter
        })
      ).rejects.toEqual(Error('Request failed with status code 503'));
    },
    TIMEOUT_30_S
  );
});
