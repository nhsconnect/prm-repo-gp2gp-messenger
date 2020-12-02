import request from 'supertest';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';
import app from '../../../app';
import { buildEhrAcknowledgement } from '../../../templates/generate-ehr-acknowledgement';
import { getPracticeAsid } from '../../../services/mhs/mhs-route-client';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';
import { logEvent, logError } from '../../../middleware/logging';

jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');
jest.mock('../../../templates/generate-ehr-acknowledgement');
jest.mock('../../../services/mhs/mhs-route-client');
jest.mock('../../../services/mhs/mhs-outbound-client');

function expectValidationErrors(
  nhsNumber,
  conversationId,
  messageId,
  odsCode,
  repositoryAsid,
  errors
) {
  return request(app)
    .post(`/health-record-requests/${nhsNumber}/acknowledgement`)
    .send({ conversationId, messageId, odsCode, repositoryAsid })
    .expect(422)
    .expect(res => {
      expect(res.body).toEqual({
        errors: errors
      });
    });
}

describe('POST /health-record-requests/{conversation-id}/acknowledgement', () => {
  const conversationId = uuidv4();
  const messageId = uuidv1();
  const nhsNumber = '1234567890';
  const odsCode = 'B1234';
  const interactionId = 'MCCI_IN010000UK13';
  const serviceId = 'urn:nhs:names:services:gp2gp:MCCI_IN010000UK13';
  const message = 'fake-acknowledgement-message';
  const repositoryAsid = '200000001162';
  const practiceAsid = '200000001163';
  const buildAckMessageInputValues = {
    conversationId,
    receivingAsid: practiceAsid,
    sendingAsid: repositoryAsid,
    messageId
  };

  describe('sendEhrAcknowledgement', () => {
    getPracticeAsid.mockReturnValue(practiceAsid);

    it('should return a 204 status code', done => {
      request(app)
        .post(`/health-record-requests/${nhsNumber}/acknowledgement`)
        .send({ conversationId, messageId, odsCode, repositoryAsid })
        .expect(204)
        .expect(() => {
          expect(getPracticeAsid).toHaveBeenCalledWith(odsCode, serviceId);
          expect(buildEhrAcknowledgement).toHaveBeenCalledWith(buildAckMessageInputValues);
        })
        .end(done);
    });

    it('should accept a messageId with uuidv4', done => {
      request(app)
        .post(`/health-record-requests/${nhsNumber}/acknowledgement`)
        .send({ conversationId, messageId: uuidv4(), odsCode, repositoryAsid })
        .expect(204)
        .end(done);
    });

    it('should send acknowledgement to mhs with correct values', done => {
      buildEhrAcknowledgement.mockReturnValue(message);
      request(app)
        .post(`/health-record-requests/${nhsNumber}/acknowledgement`)
        .send({ conversationId, messageId, odsCode, repositoryAsid })
        .expect(() => {
          expect(buildEhrAcknowledgement).toHaveBeenCalledWith(buildAckMessageInputValues);
          expect(sendMessage).toHaveBeenCalledWith({
            interactionId,
            conversationId,
            odsCode,
            message
          });
          expect(logEvent).toHaveBeenCalledWith('Acknowledgement sent to MHS');
        })
        .end(done);
    });

    it('should return a 503 when cannot send acknowledgement to mhs', async done => {
      buildEhrAcknowledgement.mockReturnValue(message);
      await sendMessage.mockRejectedValue('cannot send acknowledgement to mhs');
      request(app)
        .post(`/health-record-requests/${nhsNumber}/acknowledgement`)
        .send({ conversationId, messageId, odsCode, repositoryAsid })
        .expect(503)
        .expect(() => {
          expect(buildEhrAcknowledgement).toHaveBeenCalledWith(buildAckMessageInputValues);
          expect(sendMessage).toHaveBeenCalledWith({
            interactionId,
            conversationId,
            odsCode,
            message
          });
          expect(logError).toHaveBeenCalled();
        })
        .end(done);
    });
  });

  describe('acknowledgementValidation', () => {
    it('should return a 422 status code when nhsNumber is not 10 digits', done => {
      const invalidNhsNumber = '123';
      expectValidationErrors(invalidNhsNumber, conversationId, messageId, odsCode, repositoryAsid, [
        { nhsNumber: "'nhsNumber' provided is not 10 digits" }
      ]).end(done);
    });

    it('should return a 422 status code when nhsNumber is not numeric', done => {
      const invalidNhsNumber = 'notNumeric';
      expectValidationErrors(invalidNhsNumber, conversationId, messageId, odsCode, repositoryAsid, [
        { nhsNumber: "'nhsNumber' provided is not numeric" }
      ]).end(done);
    });

    it('should return a 422 status code when conversationId is not type uuid', done => {
      const invalidConversationId = '123';
      expectValidationErrors(nhsNumber, invalidConversationId, messageId, odsCode, repositoryAsid, [
        { conversationId: "'conversationId' provided is not of type UUIDv4" }
      ]).end(done);
    });

    it('should return a 422 status code when conversationId is not provided', done => {
      expectValidationErrors(nhsNumber, null, messageId, odsCode, repositoryAsid, [
        { conversationId: "'conversationId' provided is not of type UUIDv4" },
        { conversationId: "'conversationId' is not configured" }
      ]).end(done);
    });

    it('should return a 422 status code when messageId is not type uuid', done => {
      const invalidMessageId = 'invalid';
      expectValidationErrors(nhsNumber, conversationId, invalidMessageId, odsCode, repositoryAsid, [
        { messageId: "'messageId' provided is not of type UUID" }
      ]).end(done);
    });

    it('should return a 422 status code when messageId is not provided', done => {
      expectValidationErrors(nhsNumber, conversationId, null, odsCode, repositoryAsid, [
        { messageId: "'messageId' provided is not of type UUID" },
        { messageId: "'messageId' is not configured" }
      ]).end(done);
    });

    it('should return a 422 status code when odsCode is not provided', done => {
      expectValidationErrors(nhsNumber, conversationId, messageId, null, repositoryAsid, [
        { odsCode: "'odsCode' is not configured" }
      ]).end(done);
    });

    it('should return a 422 status code when repositoryAsid is not provided', done => {
      expectValidationErrors(nhsNumber, conversationId, messageId, odsCode, null, [
        { repositoryAsid: "'repositoryAsid' is not configured" }
      ]).end(done);
    });
  });
});
