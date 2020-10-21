const generateUpdateOdsRequest = require('../generate-update-ods-request');
import dateFormat from 'dateformat';
const { v4: uuid } = require('uuid');
const testData = require('./testData.json');

describe('generateUpdateOdsRequest', () => {
  const testObjectMissing = {
    id: uuid().toUpperCase(),
    timestamp: dateFormat(Date.now(), 'yyyymmddHHMMss'),
    receivingService: {
      asid: testData.pds.asid
    },
    sendingService: {
      asid: testData.mhs.asid
    },
    newOdsCode: 'mhs.odsCode'
  };

  const testObjectComplete = {
    ...testObjectMissing,
    patient: {
      nhsNumber: testData.tppPatient.nhsNumber,
      pdsId: testData.tppPatient.pdsId,
      pdsUpdateChangeNumber: testData.tppPatient.serialChangeNumber
    }
  };

  it('should throw error when nhsNumber is not defined in inputObject', () => {
    expect(() => generateUpdateOdsRequest(testObjectMissing)).toThrowError(
      'Check template parameter error: nhsNumber is undefined, pdsId is undefined, pdsUpdateChangeNumber is undefined'
    );
  });

  it('should throw error when receivingService and sendingObject is not defined in inputObject', () => {
    expect(() =>
      generateUpdateOdsRequest({
        id: uuid().toUpperCase(),
        timestamp: '20200101101010',
        patient: {
          nhsNumber: testData.tppPatient.nhsNumber,
          pdsId: testData.tppPatient.pdsId,
          pdsUpdateChangeNumber: testData.tppPatient.serialChangeNumber
        }
      })
    ).toThrowError(
      'Check template parameter error: asid is undefined, asid is undefined, newOdsCode is undefined'
    );
  });

  it('should not throw error when all required arguments are defined', () => {
    expect(() => generateUpdateOdsRequest(testObjectComplete)).not.toThrowError();
  });

  it('should have populate the xml template with all the required fields', () => {
    const updateODSRequest = generateUpdateOdsRequest(testObjectComplete);

    const checkEntries = object => {
      Object.keys(object).map(key => {
        if (typeof object[key] === 'object') {
          checkEntries(object[key]);
        } else {
          expect(updateODSRequest).toContain(object[key]);
        }
      });
    };

    checkEntries(testObjectComplete);
  });
});
