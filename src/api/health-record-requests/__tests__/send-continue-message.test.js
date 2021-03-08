import request from 'supertest';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { initializeConfig } from '../../../config';
import { getPracticeAsid } from '../../../services/mhs/mhs-route-client';
import { logError, logInfo } from '../../../middleware/logging';
import { generateContinueRequest } from '../../../templates/generate-continue-request';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';

jest.mock('../../../config');
jest.mock('../../../middleware/logging');
jest.mock('../../../services/mhs/mhs-route-client');
jest.mock('../../../templates/generate-continue-request');
jest.mock('../../../services/mhs/mhs-outbound-client');

describe('sendContinueMessage', () => {
  const authorizationKeys = 'correct-key';
  const deductionsAsid = '20000000890';
  initializeConfig.mockReturnValue({
    gp2gpAdaptorAuthorizationKeys: authorizationKeys,
    deductionsAsid: deductionsAsid
  });

  const serviceId = 'urn:nhs:names:services:gp2gp:COPC_IN000001UK01';
  const interactionId = 'COPC_IN000001UK01';
  const gpReceivingAsid = '20000000678';
  const message = 'fake-continue-message';
  const conversationId = uuid();
  const odsCode = 'B12345';
  const ehrExtractMessageId = uuid();
  const body = {
    conversationId,
    odsCode,
    ehrExtractMessageId
  };

  describe('success', () => {
    const generateContinueRequestInputValues = {
      messageId: uuid(),
      receivingAsid: gpReceivingAsid,
      sendingAsid: deductionsAsid,
      ehrExtractMessageId
    };

    it('should return a 204 when continue message has been created and sent', async () => {
      getPracticeAsid.mockResolvedValue(gpReceivingAsid);
      generateContinueRequest.mockReturnValueOnce(message);
      const res = await request(app)
        .post('/health-record-requests/send-continue-message')
        .send(body)
        .set('Authorization', authorizationKeys);

      expect(res.status).toEqual(204);
      expect(getPracticeAsid).toHaveBeenCalledWith(odsCode, serviceId);
      expect(generateContinueRequest).toHaveBeenCalledWith(generateContinueRequestInputValues);
      expect(sendMessage).toHaveBeenCalledWith({
        interactionId,
        conversationId,
        odsCode,
        message
      });
      expect(logInfo).toHaveBeenCalledWith('Continue message sent to MHS');
    });
  });

  describe('failure', () => {
    it('should return a 503 if cannot get practice asid', async () => {
      getPracticeAsid.mockRejectedValueOnce({});
      const res = await request(app)
        .post('/health-record-requests/send-continue-message')
        .send(body)
        .set('Authorization', authorizationKeys);

      expect(res.status).toEqual(503);
      expect(logError).toHaveBeenCalledWith('Could not send continue message');
    });

    it('should return a 503 when continue message cannot be sent', async () => {
      getPracticeAsid.mockResolvedValue(gpReceivingAsid);
      generateContinueRequest.mockReturnValueOnce(message);
      sendMessage.mockRejectedValueOnce({});

      const res = await request(app)
        .post('/health-record-requests/send-continue-message')
        .send(body)
        .set('Authorization', authorizationKeys);

      expect(res.status).toEqual(503);
      expect(logError).toHaveBeenCalledWith('Could not send continue message');
    });
  });

  describe('validation', () => {
    it('should return an error if conversationId is not valid', async () => {
      const invalidConversationId = '12345';
      const errorMessage = [{ conversationId: "'conversationId' provided is not of type UUID" }];

      const res = await request(app)
        .post('/health-record-requests/send-continue-message')
        .send({ conversationId: invalidConversationId, odsCode, ehrExtractMessageId })
        .set('Authorization', authorizationKeys);

      expect(res.status).toEqual(422);
      expect(res.body).toEqual({
        errors: errorMessage
      });
    });

    it('should return an error if odsCode is not valid', async () => {
      const errorMessage = [{ odsCode: "'odsCode' has not been provided" }];

      const res = await request(app)
        .post('/health-record-requests/send-continue-message')
        .send({ conversationId, ehrExtractMessageId })
        .set('Authorization', authorizationKeys);

      expect(res.status).toEqual(422);
      expect(res.body).toEqual({
        errors: errorMessage
      });
    });

    it('should return an error if ehrExtractMessageId is not a uuid', async () => {
      const invalidEhrExtractMessageId = '1234';
      const errorMessage = [
        { ehrExtractMessageId: "'ehrExtractMessageId' provided is not of type UUID" }
      ];

      const res = await request(app)
        .post('/health-record-requests/send-continue-message')
        .send({ conversationId, odsCode, ehrExtractMessageId: invalidEhrExtractMessageId })
        .set('Authorization', authorizationKeys);

      expect(res.status).toEqual(422);
      expect(res.body).toEqual({
        errors: errorMessage
      });
    });
  });
});
