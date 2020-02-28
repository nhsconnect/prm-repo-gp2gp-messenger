import axios from 'axios';
import testData from '../../templates/tests/testData.json';

describe('End to end test of /pds-retrieval/:nhsNumber', () => {
  it('will receive QUPA_IN000009UK03 from PDS (successful retrieval)', async () => {
    const nhsNumber =
      process.env.NODE_ENV === 'test'
        ? testData.tppPatient.nhsNumber
        : testData.patient.openTest.nhsNumber;

    const res = await axios.get(
      `https://${process.env.NODE_ENV}.gp2gp-adaptor-patient-deductions.nhs.uk/pds-retrieval/${nhsNumber}`,
      {
        headers: {
          Authorization: process.env.AUTHORIZATION_KEYS.split(',')[0]
        }
      }
    );
    expect(res.status).toBe(200);
    return expect(res.data).toMatch(/QUPA_IN000009UK03/gs);
  });
});
