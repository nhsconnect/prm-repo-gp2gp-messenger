import request from 'supertest';
import app from '../../../app';
import { retrieveEhrFromRepo } from '../../../services/ehr/retrieve-ehr-from-repo';
import { parseMultipartBody } from '../../../services/parser';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';
import { updateExtractForSending } from '../../../services/parser/message/update-extract-for-sending';
import { getPracticeAsid } from '../../../services/mhs/mhs-route-client';

jest.mock('../../../services/mhs/mhs-route-client');
jest.mock('../../../services/parser/message/update-extract-for-sending');
jest.mock('../../../services/mhs/mhs-outbound-client');
jest.mock('../../../services/parser');
jest.mock('../../../services/ehr/retrieve-ehr-from-repo');
jest.mock('../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    gp2gpAdaptorAuthorizationKeys: 'correct-key',
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613']
  })
}));

describe('healthRecordTransfers', () => {
  const authKey = 'correct-key';
  const currentEhrUrl = 'fake-url';
  const ehrExtract = 'ehr-extract';
  const conversationId = '41291044-8259-4D83-AE2B-93B7BFCABE73';
  const odsCode = 'B1234';
  const ehrRequestId = '26A541CE-A5AB-4713-99A4-150EC3DA25C6';
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

  it('should return a 204', async () => {
    const interactionId = 'RCMR_IN030000UK06';
    const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
    const message = 'ehr-message';
    const expectedSendMessageParameters = {
      interactionId,
      conversationId,
      odsCode,
      message: messageWithEhrRequestId
    };
    retrieveEhrFromRepo.mockResolvedValue(ehrExtract);
    parseMultipartBody.mockReturnValue([
      { headers: {}, body: 'soap-header' },
      { headers: {}, body: message }
    ]);
    updateExtractForSending.mockResolvedValue(messageWithEhrRequestId);
    getPracticeAsid.mockResolvedValue(receivingAsid);
    const res = await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);
    expect(res.status).toBe(204);
    expect(retrieveEhrFromRepo).toHaveBeenCalledWith(currentEhrUrl);
    expect(parseMultipartBody).toHaveBeenCalledWith(ehrExtract);
    expect(getPracticeAsid).toHaveBeenCalledWith(odsCode, serviceId);
    expect(updateExtractForSending).toHaveBeenCalledWith(message, ehrRequestId, receivingAsid);
    expect(sendMessage).toHaveBeenCalledWith(expectedSendMessageParameters);
  });

  it('should return a 503 when it cannot retrieve the extract from the message stored in EHR Repo', async () => {
    retrieveEhrFromRepo.mockResolvedValue(ehrExtract);
    parseMultipartBody.mockReturnValue([]);
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
        'Could not extract HLv7 message from the GP2GP message stored in EHR Repo'
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
    retrieveEhrFromRepo.mockResolvedValue(ehrExtract);
    getPracticeAsid.mockRejectedValue(new Error('error'));
    const res = await request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody);
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ errors: ['Sending EHR Extract failed', 'error'] });
  });

  it('should return a 503 when cannot send ehr to mhs', async () => {
    retrieveEhrFromRepo.mockResolvedValue(ehrExtract);
    parseMultipartBody.mockReturnValue([
      { headers: {}, body: 'soap-header' },
      { headers: {}, body: 'ehr-message' }
    ]);
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
