import axios from 'axios';
import dateFormat from 'dateformat';
import { v4 as uuid } from 'uuid';
import { initializeConfig } from '../../../config';
import { logError } from '../../../middleware/logging';
import generatePdsRetrievalQuery from '../../../templates/generate-pds-retrieval-request';
import testData from '../../../templates/__tests__/testData.json';
import { sendMessage, stripXMLMessage } from '../mhs-outbound-client';

jest.mock('axios');
jest.mock('../../../config/logging');
jest.mock('../../../config');
jest.mock('../../../middleware/logging');

const conversationId = uuid().toUpperCase();
const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
const interactionId = 'QUPA_IN040000UK32';
const url = 'http://url.com';

describe('mhs-outbound-client', () => {
  const message = 'message';
  const axiosHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Interaction-ID': interactionId,
      'Sync-Async': false,
      'Correlation-Id': conversationId,
      'Ods-Code': 'YES',
      'from-asid': testData.mhs.asid
    }
  };
  const axiosBody = { payload: message };
  initializeConfig.mockReturnValue({ deductionsAsid: testData.mhs.asid, mhsOutboundUrl: url });

  beforeEach(() => {
    axios.post.mockResolvedValue(Promise.resolve({ status: 200 }));
  });

  it('should reject with an Error if interactionId is not passed in', () => {
    return expect(sendMessage({ conversationId, message })).rejects.toEqual(
      Error('interactionId must be passed in')
    );
  });

  it('should log an Error if interactionId is not passed in', async done => {
    await sendMessage({ conversationId, message }).catch(() => {});
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      'validation failed',
      Error(['interactionId must be passed in'])
    );
    done();
  });

  it('should logs an Error if message is not passed in', () => {
    return expect(sendMessage({ conversationId, interactionId })).rejects.toEqual(
      Error(['message must be passed in'])
    );
  });

  it('should logs an Error if conversationId is not passed in', () => {
    return expect(sendMessage({ interactionId, message })).rejects.toEqual(
      Error(['conversationId must be passed in'])
    );
  });

  it('should reject with an Error if conversationId, message and interactionId are not passed in', async done => {
    const error = await sendMessage().catch(err => err);
    expect(error).toEqual(expect.anything(Error));
    expect(error.message).toEqual(expect.stringMatching('conversationId must be passed in'));
    expect(error.message).toEqual(expect.stringMatching('message must be passed in'));
    expect(error.message).toEqual(expect.stringMatching('interactionId must be passed in'));
    done();
  });

  it('should log an Error if conversationId, message and interactionId is not passed in', async done => {
    await sendMessage().catch(() => {});
    expect(logError).toHaveBeenCalledTimes(1);
    done();
  });

  it('throws an Error if interactionId is not passed in', () => {
    return expect(sendMessage({ conversationId, message })).rejects.toThrowError(
      Error('interactionId must be passed in')
    );
  });

  it("should call axios with odsCode 'YES' by default and return 200", async done => {
    const response = await sendMessage({ interactionId, conversationId, message });
    expect(response.status).toBe(200);
    expect(axios.post).toBeCalledWith(url, axiosBody, axiosHeaders);
    done();
  });

  it('should call axios with specified odsCode if passed in', async done => {
    const odsCode = 'A123';
    const response = await sendMessage({ interactionId, conversationId, message, odsCode });
    expect(response.status).toBe(200);
    expect(axios.post).toBeCalledWith(url, axiosBody, {
      headers: {
        ...axiosHeaders.headers,
        'Ods-Code': odsCode
      }
    });
    done();
  });

  it('should stringify and escape the payload (xml message)', async done => {
    const pdsRetrievalQuery = await generatePdsRetrievalQuery({
      id: conversationId,
      timestamp,
      receivingService: { asid: testData.pds.asid },
      sendingService: { asid: testData.mhs.asid },
      patient: { nhsNumber: testData.emisPatient.nhsNumber }
    });

    const response = await sendMessage({
      interactionId,
      conversationId,
      message: pdsRetrievalQuery
    });

    expect(response.status).toBe(200);
    expect(axios.post).toBeCalledWith(
      url,
      { payload: stripXMLMessage(pdsRetrievalQuery) },
      axiosHeaders
    );
    done();
  });

  it('should throw an Error if there is an error with axios.post request', () => {
    axios.post.mockRejectedValue(new Error());
    return expect(
      sendMessage({ interactionId, conversationId, message: 'message' })
    ).rejects.toEqual(Error(`POST ${url} - Request failed`));
  });

  it('should log an Error if there is an error with axios.post request', async done => {
    axios.post.mockRejectedValue(new Error());
    await sendMessage({ interactionId, conversationId, message: 'message' }).catch(() => {});
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(`POST ${url} - Request failed`, expect.anything());
    done();
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
