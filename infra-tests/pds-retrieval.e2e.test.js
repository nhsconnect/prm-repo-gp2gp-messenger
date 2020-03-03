import axios from 'axios';
import config from '../src/config';
import testData from '../src/templates/__tests__/testData.json';

describe('End to end test of /pds-retrieval/:nhsNumber', () => {
  it('will receive QUPA_IN000009UK03 from PDS (successful retrieval)', async () => {
    const nhsNumber =
      process.env.NHS_ENVIRONMENT === 'dev'
        ? testData.patient.openTest.nhsNumber
        : testData.tppPatient.nhsNumber;

    const res = await axios.get(`${config.url}/pds-retrieval/${nhsNumber}`, {
      headers: {
        Authorization: 'XFFGsdUdstqNjFCNnCQgaegbzpqcMp'
      }
    });
    expect(res.status).toBe(200);
    return expect(res.data).toMatch(/QUPA_IN000009UK03/gs);
  });
});
