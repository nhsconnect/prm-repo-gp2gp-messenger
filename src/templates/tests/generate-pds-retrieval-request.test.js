const generatePdsRetrievalQuery = require('../generate-pds-retrieval-request');
const uuid = require('uuid/v4');
const testData = require('./testData.json');

describe('generatePdsRetrievalQuery', () => {
  const testObjectMissing = {
    id: uuid().toUpperCase(),
    timestamp: '20200101101010',
    receivingService: {
      asid: testData.pds.asid
    },
    sendingService: {
      asid: testData.mhs.asid
    }
  };

  const testObjectComplete = {
    ...testObjectMissing,
    patient: {
      nhsNumber: testData.tppPatient.nhsNumber
    }
  };

  it('should throw error when nhsNumber is not defined in inputObject', () => {
    expect(() => generatePdsRetrievalQuery(testObjectMissing)).toThrowError(
      Error('nhsNumber is undefined')
    );
  });

  it('should not throw error when all required arguments are defined', () => {
    expect(() => generatePdsRetrievalQuery(testObjectComplete)).not.toThrowError();
  });

  it('should have populate the xml template with all the required fields', () => {
    const ehrRequestQuery = generatePdsRetrievalQuery(testObjectComplete);

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
