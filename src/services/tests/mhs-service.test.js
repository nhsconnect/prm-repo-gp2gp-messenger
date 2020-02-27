import axios from 'axios';
import dateFormat from 'dateformat';
import uuid from 'uuid/v4';
import config from '../../config';
import { updateLogEventWithError } from '../../middleware/logging';
import generatePdsRetrievalQuery from '../../templates/generate-pds-retrieval-request';
import testData from '../../templates/tests/testData.json';
import { sendMessage, stripXMLMessage } from '../mhs-service';

jest.mock('../../config/logging');
jest.mock('../../middleware/logging');

jest.mock('axios');

const conversationId = uuid().toUpperCase();
const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
const interactionId = 'QUPA_IN040000UK32';
const url = 'http://url.com';

describe('mhs-service', () => {
  const message = 'message';

  const requestOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Interaction-ID': interactionId,
      'Sync-Async': false,
      'Correlation-Id:': conversationId,
      'Ods-Code': 'YES',
      'from-asid': testData.mhs.asid
    },
    data: {
      payload: message
    }
  };

  beforeEach(() => {
    config.deductionsAsid = testData.mhs.asid;
    config.mhsOutboundUrl = url;
    axios.post.mockResolvedValue(Promise.resolve({ status: 200 }));
  });

  afterEach(() => {
    config.deductionsAsid = process.env.DEDUCTIONS_ASID;
    config.mhsOutboundUrl =
      process.env.MHS_OUTBOUND_PREFIX_URL + process.env.NODE_ENV + process.env.MHS_OUTBOUND_URL;
    jest.clearAllMocks();
  });

  it('logs an Error if interactionId is not passed in', () => {
    return sendMessage({ conversationId, message }).catch(err => {
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
    return sendMessage({ interactionId, message }).catch(err => {
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
    return expect(sendMessage({ conversationId, message })).rejects.toThrowError(
      Error('interactionId must be passed in')
    );
  });

  it("should call axios with odsCode 'YES' by default and return 200", () => {
    return sendMessage({ interactionId, conversationId, message }).then(response => {
      expect(response.status).toBe(200);
      expect(axios.post).toBeCalledWith(url, requestOptions);
    });
  });

  it('should call axios with specified odsCode if passed in', () => {
    const odsCode = 'A123';
    return sendMessage({ interactionId, conversationId, message, odsCode }).then(response => {
      expect(response.status).toBe(200);
      expect(axios.post).toBeCalledWith(url, {
        ...requestOptions,
        headers: { ...requestOptions.headers, 'Ods-Code': odsCode }
      });
    });
  });

  it('should stringify and escape the payload (xml message)', async () => {
    const pdsRetrievalQuery = await generatePdsRetrievalQuery({
      id: conversationId,
      timestamp,
      receivingService: { asid: testData.pds.asid },
      sendingService: { asid: testData.mhs.asid },
      patient: { nhsNumber: testData.emisPatient.nhsNumber }
    });

    return sendMessage({ interactionId, conversationId, message: pdsRetrievalQuery }).then(
      response => {
        expect(response.status).toBe(200);
        expect(axios.post).toBeCalledWith(url, {
          ...requestOptions,
          data: { payload: stripXMLMessage(pdsRetrievalQuery) }
        });
      }
    );
  });

  it('should call updateLogEventWithError if there is an error with axios.post request', () => {
    axios.post.mockRejectedValue(new Error());
    return sendMessage({ interactionId, conversationId, message: 'message' }).catch(err => {
      const error = Error(
        `POST ${url} - Request failed - ${JSON.stringify({
          ...requestOptions,
          data: { payload: 'message' }
        })}`
      );
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(error);
      return expect(err).toEqual(error);
    });
  });
});

describe('stripXMLMessage', () => {
  const pdsQueryArguments = {
    id: conversationId,
    timestamp,
    receivingService: { asid: testData.pds.asid },
    sendingService: { asid: testData.mhs.asid },
    patient: { nhsNumber: testData.emisPatient.nhsNumber }
  };

  it('should return a string', async () => {
    const pdsRetrievalQuery = await generatePdsRetrievalQuery(pdsQueryArguments);
    expect(typeof stripXMLMessage(pdsRetrievalQuery) === 'string').toBe(true);
  });

  it('should remove spaces between xml tags', async () => {
    const pdsRetrievalQuery = await generatePdsRetrievalQuery(pdsQueryArguments);
    expect(stripXMLMessage(pdsRetrievalQuery).match(/> +</g)).toBe(null);
  });

  it('should trim the message', async () => {
    const pdsRetrievalQuery = await generatePdsRetrievalQuery(pdsQueryArguments);
    expect(stripXMLMessage(` ${pdsRetrievalQuery}     `).match(/^ +| +$/)).toBe(null);
  });

  it('should remove new lines (/n) and carriage return characters (/r)', async () => {
    const pdsRetrievalQuery = await generatePdsRetrievalQuery(pdsQueryArguments);
    expect(stripXMLMessage(pdsRetrievalQuery).match(/\r?\n|\r/g)).toBe(null);
  });
});
