const generateEhrRequestQuery = require('../ehr-request-template');
const uuid = require('uuid/v4');

describe('generateEhrRequestQuery', () => {
  const sendingService = {
    odsCode: 'ba21',
    asid: '123'
  };

  const receivingService = {
    asid: 'abc',
    odsCode: 'ab12'
  };

  const testObjectMissing = {
    id: uuid(),
    timestamp: '20200101101010',
    sendingService,
    receivingService
  };

  const testObjectComplete = {
    ...testObjectMissing,
    patient: {
      nhsNumber: '1234567890'
    }
  };

  it('should throw error when nhsNumber is not defined in inputObject', () => {
    expect(() => generateEhrRequestQuery(testObjectMissing)).toThrowError(
      Error('nhsNumber is undefined')
    );
  });

  it('should not throw error when all required arguments are defined', () => {
    expect(() => generateEhrRequestQuery(testObjectComplete)).not.toThrowError();
  });
});
