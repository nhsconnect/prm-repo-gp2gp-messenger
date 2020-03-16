import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import config from '../src/config';
import testData from '../src/templates/__tests__/testData.json';

describe('End to end test of /patient-demographics/:nhsNumber', () => {
  it('will receive QUPA_IN000009UK03 from PDS (successful retrieval)', () => {
    const nhsNumber =
      process.env.NHS_ENVIRONMENT === 'dev'
        ? testData.patient.openTest.nhsNumber
        : testData.tppPatient.nhsNumber;

    return axios
      .get(`${config.url}/patient-demographics/${nhsNumber}`, {
        headers: {
          Authorization: process.env.AUTHORIZATION_KEYS.split(',')[0]
        },
        adapter
      })
      .then(response => expect(response.status).toBe(200))
      .catch(error => expect(error).toEqual(new Error('Request failed with status code 503')));
  });

  it('should receive QUQI_IN010000UK14 from PDS if the nhs number is not exist', () => {
    const fakeNhsNumber = '0000000000';

    return axios
      .get(`${config.url}/patient-demographics/${fakeNhsNumber}`, {
        headers: {
          Authorization: process.env.AUTHORIZATION_KEYS.split(',')[0]
        },
        adapter
      })
      .then(response => expect(response.status).toBe(200))
      .catch(error => expect(error).toEqual(new Error('Request failed with status code 503')));
  });
});
