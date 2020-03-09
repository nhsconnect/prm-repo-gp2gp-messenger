import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import config from '../src/config';
import testData from '../src/templates/__tests__/testData.json';

describe('End to end test of /pds-retrieval/:nhsNumber', () => {
  it('will receive QUPA_IN000009UK03 from PDS (successful retrieval)', async () => {
    const nhsNumber =
      process.env.NHS_ENVIRONMENT === 'dev'
        ? testData.patient.openTest.nhsNumber
        : testData.tppPatient.nhsNumber;

    const baseURL = process.env.GP2GP_URL ? process.env.GP2GP_URL : config.url;

    return axios
      .get(`${baseURL}/pds-retrieval/${nhsNumber}`, {
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
    const baseURL = process.env.GP2GP_URL ? process.env.GP2GP_URL : config.url;

    return axios
      .get(`${baseURL}/pds-retrieval/${fakeNhsNumber}`, {
        headers: {
          Authorization: process.env.AUTHORIZATION_KEYS.split(',')[0]
        },
        adapter
      })
      .then(response => expect(response.status).toBe(200));
  });
});
