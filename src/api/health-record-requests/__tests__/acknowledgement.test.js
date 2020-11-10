import request from 'supertest';
import { v4 as uuid } from 'uuid';
import app from '../../../app';

jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');

const conversationId = uuid();
const nhsNumber = '1234567890';

function expectErrors(nhsNumber, conversationId, errors) {
  return request(app)
    .post(`/health-record-requests/${nhsNumber}/acknowledgement`)
    .send({ conversationId: conversationId })
    .expect(422)
    .expect(res => {
      expect(res.body).toEqual({
        errors: errors
      });
    });
}

describe('POST /health-record-requests/{conversation-id}/acknowledgement', () => {
  it('should return a 200 status code', done => {
    request(app)
      .post(`/health-record-requests/${nhsNumber}/acknowledgement`)
      .send({ conversationId })
      .expect(200)
      .end(done);
  });
  it('should return a 422 status code when nhsNumber is not 10 digits', done => {
    const invalidNhsNumber = '123';
    expectErrors(invalidNhsNumber, conversationId, [
      { nhsNumber: "'nhsNumber' provided is not 10 digits" }
    ]).end(done);
  });
  it('should return a 422 status code when nhsNumber is not numeric', done => {
    const invalidNhsNumber = 'notNumeric';
    expectErrors(invalidNhsNumber, conversationId, [
      { nhsNumber: "'nhsNumber' provided is not numeric" }
    ]).end(done);
  });
  it('should return a 422 status code when conversationId is not type uuid', done => {
    const invalidConversationId = '123';
    expectErrors(nhsNumber, invalidConversationId, [
      { conversationId: "'conversationId' provided is not of type UUIDv4" }
    ]).end(done);
  });
  it('should return a 422 status code when conversationId is not provided', done => {
    expectErrors(nhsNumber, null, [
      { conversationId: "'conversationId' provided is not of type UUIDv4" },
      { conversationId: "'conversationId' is not configured" }
    ]).end(done);
  });
});
