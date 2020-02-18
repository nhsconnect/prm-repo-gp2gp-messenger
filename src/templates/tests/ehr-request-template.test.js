const generateEhrRequestQuery = require('../ehr-request-template');
const uuid = require('uuid/v4');

describe('generateEhrRequestQuery', () => {
  const testObjectMissing = {
    id: uuid(),
    timestamp: '20200101101010',
    receivingAsid: 'abc',
    sendingAsid: '123',
    receivingOdsCode: 'ab12',
    sendingOdsCode: 'ba21'
  };

  const testObjectComplete = {
    ...testObjectMissing,
    nhsNumber: '1234567890'
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
