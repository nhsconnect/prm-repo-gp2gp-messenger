import { when } from 'jest-when';
import request from 'supertest';
import app from '../../../app';
import { logError } from '../../../middleware/logging';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';
import generateUpdateOdsRequest from '../../../templates/generate-update-ods-request';
import { fakeDateNow } from '../../../__mocks__/dateformat';

jest.mock('../../../config/logging');
jest.mock('../../../config/', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    pdsAsid: 'pdsAsid',
    deductionsAsid: 'deductionsAsid',
    deductionsOdsCode: 'deductionsOds',
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613']
  })
}));
jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');
jest.mock('../../../services/mhs/mhs-outbound-client');
jest.mock('../../../templates/generate-update-ods-request');

describe('POST /patient-demographics/:nhsNumber', () => {
  const fakerequest =
    '<PRPA_IN000203UK03 xmlns="urn:hl7-org:v3" xmlns:hl7="urn:hl7-org:v3"></PRPA_IN000203UK03>';
  const interactionId = 'PRPA_IN000203UK03';
  const mockUUID = 'ebf6ee70-b9b7-44a6-8780-a386fccd759c';
  const mockErrorUUID = 'fd9271ea-9086-4f7e-8993-0271518fdb6f';
  const error503MockUuid = '893b17bc-5369-4ca1-a6aa-579f2f5cb318';

  beforeEach(() => {
    process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS = 'correct-key';

    when(sendMessage)
      .calledWith({
        interactionId,
        conversationId: error503MockUuid.toUpperCase(),
        message: fakerequest
      })
      .mockResolvedValue({ status: 503, data: 'MHS Error' })
      .calledWith({
        interactionId,
        conversationId: mockUUID.toUpperCase(),
        message: fakerequest
      })
      .mockResolvedValue({ status: 202, data: {} })
      .calledWith({
        interactionId,
        conversationId: mockErrorUUID.toUpperCase(),
        message: fakerequest
      })
      .mockResolvedValue({ status: 500, data: '500 MHS Error' });

    generateUpdateOdsRequest.mockResolvedValue(fakerequest);
  });

  it('should return a 204 (no content) if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz',
        newOdsCode: '12345',
        conversationId: mockUUID
      })
      .expect(204)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should call generateUpdateOdsRequest with correct values', done => {
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz',
        newOdsCode: '12345',
        conversationId: mockUUID
      })
      .expect(() => {
        expect(generateUpdateOdsRequest).toHaveBeenCalledWith({
          id: mockUUID.toUpperCase(),
          timestamp: fakeDateNow,
          receivingService: { asid: 'pdsAsid' },
          sendingService: { asid: 'deductionsAsid' },
          newOdsCode: '12345',
          patient: {
            nhsNumber: '9442964410',
            pdsId: 'cppz',
            pdsUpdateChangeNumber: '123'
          }
        });
      })
      .end(done);
  });

  it('should return an error if :nhsNumber is less than 10 digits', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
    request(app)
      .patch('/patient-demographics/944410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz',
        newOdsCode: '12345',
        conversationId: mockUUID
      })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(logError).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledWith('validation-failed', { errors: errorMessage });
      })
      .end(done);
  });

  it('should return an error if :serialChangeNumber is not numeric', done => {
    const errorMessage = [{ serialChangeNumber: "'serialChangeNumber' provided is not numeric" }];
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: 'xxx',
        pdsId: 'cppz',
        newOdsCode: '12345',
        conversationId: mockUUID
      })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(logError).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledWith('validation-failed', { errors: errorMessage });
      })
      .end(done);
  });

  it('should return an error if :pdsId is not provided', done => {
    const errorMessage = [{ pdsId: "'pdsId' has not been provided" }];
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123',
        newOdsCode: '12345',
        conversationId: mockUUID
      })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(logError).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledWith('validation-failed', { errors: errorMessage });
      })
      .end(done);
  });

  it('should return an error if :conversationId is not a uuid', done => {
    const errorMessage = [{ conversationId: "'conversationId' provided is not of type UUIDv4" }];
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        conversationId: 'wrong-format-not-uuid',
        serialChangeNumber: '123',
        pdsId: 'cppz',
        newOdsCode: '12345'
      })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(logError).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledWith('validation-failed', { errors: errorMessage });
      })
      .end(done);
  });

  it('should return an error if :newOdsCode is not provided', done => {
    const errorMessage = [{ newOdsCode: "'newOdsCode' has not been provided" }];
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz',
        conversationId: mockUUID
      })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(logError).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledWith('validation-failed', { errors: errorMessage });
      })
      .end(done);
  });

  it('should return a 503 with error message if mhs returns a 500 status code', done => {
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz',
        newOdsCode: '12345',
        conversationId: mockErrorUUID
      })
      .expect(res => {
        expect(res.status).toBe(503);
        expect(res.body.errors).toBe('MHS Error: 500 MHS Error');
      })
      .end(done);
  });

  it('should return a 503 with error message if mhs returns a 503 status code', done => {
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz',
        newOdsCode: '12345',
        conversationId: error503MockUuid
      })
      .expect(res => {
        expect(res.status).toBe(503);
        expect(res.body.errors).toBe('Unexpected Error - HTTP code: 503');
      })
      .end(done);
  });
});
