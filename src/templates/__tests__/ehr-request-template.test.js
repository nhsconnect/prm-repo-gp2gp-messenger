import { v4 as uuid } from 'uuid';
import generateEhrRequestQuery from '../ehr-request-template';
import testData from './testData.json';

describe('generateEhrRequestQuery', () => {
  const testObjectMissing = {
    id: uuid().toUpperCase(),
    timestamp: '20200403092516',
    sendingService: {
      odsCode: testData.mhs.odsCode,
      asid: testData.mhs.asid
    },
    receivingService: {
      odsCode: testData.emisPractise.odsCode,
      asid: testData.emisPractise.asid
    }
  };

  const testObjectComplete = {
    ...testObjectMissing,
    patient: {
      nhsNumber: testData.emisPatient.nhsNumber
    }
  };

  it('should throw error when nhsNumber is not defined in inputObject', () => {
    expect(() => generateEhrRequestQuery(testObjectMissing)).toThrowError(
      'Check template parameter error: nhsNumber is undefined'
    );
  });

  it('should not throw error when all required arguments are defined', () => {
    expect(() => generateEhrRequestQuery(testObjectComplete)).not.toThrowError();
  });

  it('should have populate the xml template with all the required fields', () => {
    const ehrRequestQuery = generateEhrRequestQuery(testObjectComplete);

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

  it('should throw error when receivingService and sendingObject is not defined in inputObject', () => {
    expect(() =>
      generateEhrRequestQuery({
        id: uuid().toUpperCase(),
        timestamp: '20200403092516'
      })
    ).toThrowError(
      'Check template parameter error: asid is undefined, odsCode is undefined, asid is undefined, odsCode is undefined'
    );
  });
});
