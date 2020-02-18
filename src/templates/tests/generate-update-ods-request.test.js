const generateUpdatePdsRequest = require('../generate-update-ods-request');
const uuid = require('uuid/v4');
const testData = require('./testData.json');

describe('generateUpdatePdsRequest', () => {
  const testObjectMissing = {
    id: uuid().toUpperCase(),
    timestamp: '20200101101010',
    receivingService: {
      asid: testData.pds.asid
    },
    sendingService: {
      asid: testData.mhs.asid,
      odsCode: 'mhs.odsCode'
    }
  };

  const testObjectComplete = {
    ...testObjectMissing,
    patient: {
      nhsNumber: testData.tppPatient.nhsNumber,
      pdsId: testData.tppPatient.pdsId,
      pdsUpdateChangeNumber: testData.tppPatient.serialChaneNumber
    }
  };

  it('should throw error when nhsNumber is not defined in inputObject', () => {
    expect(() => generateUpdatePdsRequest(testObjectMissing)).toThrowError(
      Error('nhsNumber is undefined')
    );
  });

  it('should not throw error when all required arguments are defined', () => {
    expect(() => generateUpdatePdsRequest(testObjectComplete)).not.toThrowError();
  });

  it('should have populate the xml template with all the required fields', () => {
    const ehrRequestQuery = generateUpdatePdsRequest(testObjectComplete);

    const checkEntries = object => {
      Object.keys(object).map(key => {
        if (typeof object[key] === 'object') {
          checkEntries(object[key]);
        } else {
          expect(ehrRequestQuery).toContain(object[key]);
        }
      });
    };

    checkEntries(testObjectComplete);
  });
});
