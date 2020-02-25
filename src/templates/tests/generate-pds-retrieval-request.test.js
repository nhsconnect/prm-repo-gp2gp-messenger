const generatePdsRetrievalQuery = require('../generate-pds-retrieval-request');
const dateFormat = require('dateformat');
const uuid = require('uuid/v4');
const testData = require('./testData.json');

describe('generatePdsRetrievalQuery', () => {
  const testObjectMissing = {
    id: uuid().toUpperCase(),
    timestamp: dateFormat(Date.now(), 'yyyymmddHHMMss'),
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
    return expect(generatePdsRetrievalQuery(testObjectMissing)).rejects.toThrowError(
      'nhsNumber is undefined'
    );
  });

  it('should not throw error when all required arguments are defined', () => {
    return expect(generatePdsRetrievalQuery(testObjectComplete)).resolves.toEqual(
      expect.anything()
    );
  });

  it('should have populate the xml template with all the required fields', async done => {
    const ehrRequestQuery = await generatePdsRetrievalQuery(testObjectComplete);

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
    done();
  });

  it('should return a Promise (can use .then())', () => {
    generatePdsRetrievalQuery(testObjectComplete).then(response => {
      return expect(typeof response === 'string');
    });
  });

  describe('checkTemplateArguments', () => {
    it("should throw 'asid is undefined' if not pass in receivingService object", () => {
      return expect(
        generatePdsRetrievalQuery({
          id: uuid().toUpperCase(),
          timestamp: dateFormat(Date.now(), 'yyyymmddHHMMss'),
          sendingService: {
            asid: testData.mhs.asid
          },
          patient: {
            nhsNumber: testData.tppPatient.nhsNumber
          }
        })
      ).rejects.toThrowError('asid is undefined');
    });
  });

  describe('checkTemplateArguments', () => {
    it("should throw 'asid is undefined' if not pass in sendingService object", () => {
      return expect(
        generatePdsRetrievalQuery({
          id: uuid().toUpperCase(),
          timestamp: dateFormat(Date.now(), 'yyyymmddHHMMss'),
          receivingService: {
            asid: testData.pds.asid
          },
          patient: {
            nhsNumber: testData.tppPatient.nhsNumber
          }
        })
      ).rejects.toThrowError('asid is undefined');
    });
  });
});
