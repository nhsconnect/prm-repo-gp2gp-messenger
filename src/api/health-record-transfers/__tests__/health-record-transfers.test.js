import request from 'supertest';
import app from '../../../app';
import { retrieveEhrFromRepo } from '../../../services/ehr/retrieve-ehr-from-repo';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';
import { updateExtractForSending } from '../../../services/parser/message/update-extract-for-sending';
import { jsonEhrExtract, payload } from './data/json-formatted-ehr-example';
import { getPracticeAsid } from '../../../services/fhir/sds-fhir-client';
import { wrangleAttachments } from '../../../services/mhs/mhs-attachments-wrangler';

jest.mock('../../../services/fhir/sds-fhir-client');
jest.mock('../../../services/parser/message/update-extract-for-sending');
jest.mock('../../../services/mhs/mhs-outbound-client');
jest.mock('../../../services/mhs/mhs-attachments-wrangler');
jest.mock('../../../services/ehr/retrieve-ehr-from-repo');
jest.mock('../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    consumerApiKeys: { TEST_USER: 'correct-key' }
  })
}));

describe('healthRecordTransfers', () => {
  const authKey = 'correct-key';
  const currentEhrUrl = 'fake-url';
  const ehrExtractWithoutPayload = { ebXML: 'no-payload-here' };
  const ehrExtractNotJson = 'not-expected-format';
  const conversationId = '41291044-8259-4d83-ae2b-93b7bfcabe73';
  const odsCode = 'B1234';
  const ehrRequestId = '26a541ce-a5ab-4713-99a4-150ec3da25c6';
  const messageWithEhrRequestId = 'message-ehr-req-id';
  const receivingAsid = '2000000000678';
  const mockBody = {
    data: {
      type: 'health-record-transfers',
      id: conversationId,
      attributes: {
        odsCode: odsCode,
        ehrRequestId: ehrRequestId
      },
      links: {
        currentEhrUrl: currentEhrUrl
      }
    }
  };

  it('should return a 204 for a simple EHR send without attachments', async () => {
    const interactionId = 'RCMR_IN030000UK06';
    const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
    const expectedSendMessageParameters = {
      interactionId,
      conversationId,
      odsCode,
      message: messageWithEhrRequestId
    };
    retrieveEhrFromRepo.mockResolvedValue(jsonEhrExtract);
    updateExtractForSending.mockResolvedValue(messageWithEhrRequestId);
    getPracticeAsid.mockResolvedValue(receivingAsid);

    wrangleAttachments.mockReturnValue({});

    const res = await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);

    expect(res.status).toBe(204);
    expect(retrieveEhrFromRepo).toHaveBeenCalledWith(currentEhrUrl);
    expect(getPracticeAsid).toHaveBeenCalledWith(odsCode, serviceId);
    expect(updateExtractForSending).toHaveBeenCalledWith(payload, ehrRequestId, receivingAsid);
    expect(sendMessage).toHaveBeenCalledWith(expectedSendMessageParameters);
  });

  it('should include attachments as part of mhs message send, if returned from the mhs attachments wrangler based on envelope xml', async () => {
    const attachments = [{
      an: "attachment",
      another: "attachment"
    }];

    wrangleAttachments.mockReturnValue({ 'attachments': attachments });

    retrieveEhrFromRepo.mockResolvedValue(jsonEhrExtract);
    updateExtractForSending.mockResolvedValue(messageWithEhrRequestId);
    getPracticeAsid.mockResolvedValue(receivingAsid);

    await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);

    expect(wrangleAttachments).toHaveBeenCalledWith(jsonEhrExtract.ebXML)
    expect(sendMessage).toHaveBeenCalledWith({
      interactionId: 'RCMR_IN030000UK06',
      conversationId,
      odsCode,
      message: messageWithEhrRequestId,
      attachments
    });
  });

  it('should return a 503 when it cannot retrieve the extract from the message stored in EHR Repo', async () => {
    retrieveEhrFromRepo.mockResolvedValue(ehrExtractWithoutPayload);
    updateExtractForSending.mockResolvedValue(messageWithEhrRequestId);
    getPracticeAsid.mockResolvedValue(receivingAsid);
    const res = await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);
    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      errors: [
        'Sending EHR Extract failed',
        'Could not extract payload from the JSON message stored in EHR Repo'
      ]
    });
  });

  it('should return a 503 when the message stored in EHR Repo is not a json', async () => {
    retrieveEhrFromRepo.mockResolvedValue(ehrExtractNotJson);
    updateExtractForSending.mockResolvedValue(messageWithEhrRequestId);
    getPracticeAsid.mockResolvedValue(receivingAsid);
    const res = await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);
    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      errors: [
        'Sending EHR Extract failed',
        'Could not extract payload from the JSON message stored in EHR Repo'
      ]
    });
  });

  it('should return a 503 when cannot retrieve ehr from presigned url', async () => {
    retrieveEhrFromRepo.mockRejectedValue(new Error('error'));
    const res = await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ errors: ['Sending EHR Extract failed', 'error'] });
  });

  it('should return a 503 when cannot retrieve practice asid', async () => {
    getPracticeAsid.mockRejectedValue(new Error('error'));
    const res = await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ errors: ['Sending EHR Extract failed', 'error'] });
  });

  it('should return a 503 when cannot send ehr to mhs', async () => {
    retrieveEhrFromRepo.mockResolvedValue(jsonEhrExtract);
    updateExtractForSending.mockResolvedValue(messageWithEhrRequestId);
    getPracticeAsid.mockResolvedValue(receivingAsid);
    sendMessage.mockRejectedValue(new Error('error'));
    const res = await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ errors: ['Sending EHR Extract failed', 'error'] });
  });

  describe('validation', () => {
    it('should return correct error message if type is not health-record-transfers', async () => {
      const errorMessage = [{ 'data.type': "Provided value is not 'health-record-transfers'" }];
      const res = await request(app)
        .post('/health-record-transfers')
        .set('Authorization', authKey)
        .send({ data: { ...mockBody.data, type: 'xxx' } });

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ errors: errorMessage });
    });

    it('should return correct error message if conversationId is not uuid', async () => {
      const errorMessage = [{ 'data.id': "'conversationId' provided is not of type UUID" }];
      const res = await request(app)
        .post('/health-record-transfers')
        .set('Authorization', authKey)
        .send({ data: { ...mockBody.data, id: 'xxx' } });

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ errors: errorMessage });
    });

    it('should return correct error message if odsCode is missing', async () => {
      const errorMessage = [{ 'data.attributes.odsCode': 'Value has not been provided' }];
      const res = await request(app)
        .post('/health-record-transfers')
        .set('Authorization', authKey)
        .send({
          data: { ...mockBody.data, attributes: { ...mockBody.data.attributes, odsCode: '' } }
        });

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ errors: errorMessage });
    });

    it('should return correct error message if ehrRequestId is not uuid', async () => {
      const errorMessage = [
        { 'data.attributes.ehrRequestId': 'Provided value is not of type UUID' }
      ];
      const res = await request(app)
        .post('/health-record-transfers')
        .set('Authorization', authKey)
        .send({
          data: {
            ...mockBody.data,
            attributes: { ...mockBody.data.attributes, ehrRequestId: 'xxx' }
          }
        });

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ errors: errorMessage });
    });

    it('should return correct error message if currentEhrUrl is not provided', async () => {
      const errorMessage = [{ 'data.links.currentEhrUrl': 'Value has not been provided' }];
      const res = await request(app)
        .post('/health-record-transfers')
        .set('Authorization', authKey)
        .send({
          data: {
            ...mockBody.data,
            links: { ...mockBody.data.links, currentEhrUrl: '' }
          }
        });

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ errors: errorMessage });
    });
  });

  describe('authentication', () => {
    it('should return a 401 if Authorization Header is not provided', async () => {
      const res = await request(app).post('/health-record-transfers').send(mockBody);

      expect(res.request.header['Authorization']).toBeUndefined();
      expect(res.statusCode).toBe(401);
    });
  });
});
