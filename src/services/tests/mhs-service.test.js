import axios from 'axios';
import dateFormat from 'dateformat';
import uuid from 'uuid/v4';
import { updateLogEventWithError } from '../../middleware/logging';
import generatePdsRetrievalQuery from '../../templates/generate-pds-retrieval-request';
import testData from '../../templates/tests/testData.json';
import { processXmlMessage, sendMessage } from '../mhs-service';

jest.mock('../../config/logging');
jest.mock('../../middleware/logging');

jest.mock('axios');

const conversationId = uuid().toUpperCase();
const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
const interactionId = 'QUPA_IN040000UK32';

describe('mhs-service', () => {
  const pdsRetrievalQuery = generatePdsRetrievalQuery({
    id: conversationId,
    timestamp,
    receivingService: { asid: testData.pds.asid },
    sendingService: { asid: testData.mhs.asid },
    patient: { nhsNumber: testData.emisPatient.nhsNumber }
  });

  const requestOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Interaction-ID': interactionId,
      'Sync-Async': false,
      'Correlation-Id:': conversationId,
      'Ods-Code': 'YES'
    },
    data: {
      payload: processXmlMessage(pdsRetrievalQuery)
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();
    axios.post.mockResolvedValue(Promise.resolve({ status: 200 }));
  });

  it('logs an Error if interactionId is not passed in', () => {
    return sendMessage({ conversationId, message: pdsRetrievalQuery }).catch(err => {
      const error = Error(['interactionId must be passed in']);
      expect(err).toEqual(error);
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(error);
    });
  });

  it('logs an Error if message is not passed in', () => {
    return sendMessage({ conversationId, interactionId }).catch(err => {
      const error = Error(['message must be passed in']);
      expect(err).toEqual(error);
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(error);
    });
  });

  it('logs an Error if conversationId is not passed in', () => {
    const error = Error(['conversationId must be passed in']);
    return sendMessage({ interactionId, message: pdsRetrievalQuery }).catch(err => {
      expect(err).toEqual(error);
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(error);
    });
  });

  it('logs an Error if conversationId, message and interactionId is not passed in', () => {
    return sendMessage().catch(err => {
      expect(err.message).toContain('conversationId must be passed in');
      expect(err.message).toContain('interactionId must be passed in');
      expect(err.message).toContain('message must be passed in');
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('throws an Error if interactionId is not passed in', () => {
    return expect(sendMessage({ conversationId, message: pdsRetrievalQuery })).rejects.toThrowError(
      Error('interactionId must be passed in')
    );
  });

  it("should call axios with odsCode 'YES' by default and return 200", () => {
    return sendMessage({ interactionId, conversationId, message: pdsRetrievalQuery }).then(
      response => {
        expect(response.status).toBe(200);
        expect(axios.post).toBeCalledWith(
          'https://gpitbjss.atlassian.net/wiki/spaces/TW/pages/1802240048/MHS+Adapter+GP2GP+Compliance',
          requestOptions
        );
      }
    );
  });

  it('should call axios with specified odsCode if passed in', () => {
    const odsCode = 'A123';
    return sendMessage({ interactionId, conversationId, message: pdsRetrievalQuery, odsCode }).then(
      response => {
        expect(response.status).toBe(200);
        expect(axios.post).toBeCalledWith(
          'https://gpitbjss.atlassian.net/wiki/spaces/TW/pages/1802240048/MHS+Adapter+GP2GP+Compliance',
          {
            ...requestOptions,
            headers: { ...requestOptions.headers, 'Ods-Code': odsCode }
          }
        );
      }
    );
  });

  it('should stringify and escape the payload (xml message)', () => {
    return sendMessage({ interactionId, conversationId, message: pdsRetrievalQuery }).then(
      response => {
        expect(response.status).toBe(200);
        expect(axios.post).toBeCalledWith(
          'https://gpitbjss.atlassian.net/wiki/spaces/TW/pages/1802240048/MHS+Adapter+GP2GP+Compliance',
          requestOptions
        );
      }
    );
  });
});

describe('processXmlMessage', () => {
  const pdsRetrievalQuery = generatePdsRetrievalQuery({
    id: conversationId,
    timestamp,
    receivingService: { asid: testData.pds.asid },
    sendingService: { asid: testData.mhs.asid },
    patient: { nhsNumber: testData.emisPatient.nhsNumber }
  });

  it('should return a string', () => {
    expect(typeof processXmlMessage(pdsRetrievalQuery) === 'string').toBe(true);
  });

  it('should remove spaces between xml tags', () => {
    expect(processXmlMessage(pdsRetrievalQuery).match(/> +</g)).toBe(null);
  });

  it('should trim the message', () => {
    expect(processXmlMessage(` ${pdsRetrievalQuery}     `).match(/^ +| +$/)).toBe(null);
  });

  it('should remove new lines (/n) and carriage return characters (/r)', () => {
    expect(processXmlMessage(pdsRetrievalQuery).match(/\r?\n|\r/g)).toBe(null);
  });
});
