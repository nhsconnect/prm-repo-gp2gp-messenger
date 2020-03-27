import { when } from 'jest-when';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import app from '../../../app';
import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';
import generateUpdateOdsRequest from '../../../templates/generate-update-ods-request';

jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');
jest.mock('../../../services/mhs/mhs-outbound-client');
jest.mock('../../../templates/generate-update-ods-request');

const fakerequest =
  '<PRPA_IN000203UK03 xmlns="urn:hl7-org:v3" xmlns:hl7="urn:hl7-org:v3"></PRPA_IN000203UK03>';

const interactionId = 'PRPA_IN000203UK03';
const mockUUID = 'ebf6ee70-b9b7-44a6-8780-a386fccd759c';
const mockErrorUUID = 'fd9271ea-9086-4f7e-8993-0271518fdb6f';

function generateLogEvent(message) {
  return {
    status: 'validation-failed',
    validation: {
      errors: message,
      status: 'failed'
    }
  };
}

describe('POST /patient-demographics/:nhsNumber', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';
    config.pdsAsid = 'pdsAsid';
    config.deductionsAsid = 'deductionsAsid';
    uuid.mockImplementation(() => mockUUID);

    when(sendMessage)
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
        pdsId: 'cppz'
      })
      .expect(204)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return an error if :nhsNumber is less than 10 digits', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
    request(app)
      .patch('/patient-demographics/944410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz'
      })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
      })
      .end(done);
  });

  it('should return an error if :serialChangeNumber is not numeric', done => {
    const errorMessage = [{ serialChangeNumber: "'serialChangeNumber' provided is not numeric" }];
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: 'xxx',
        pdsId: 'cppz'
      })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
      })
      .end(done);
  });

  it('should return an error if :pdsId is not provided', done => {
    const errorMessage = [{ pdsId: "'pdsId' has not been provided" }];
    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123'
      })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
      })
      .end(done);
  });

  it('should return a 503 with error message if mhs returns a 500 status code', done => {
    uuid.mockImplementation(() => mockErrorUUID);

    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz'
      })
      .expect(res => {
        expect(res.status).toBe(503);
        expect(res.body.errors).toBe('MHS Error: 500 MHS Error');
      })
      .end(done);
  });

  it('should return a 503 with error message if mhs returns a 503 status code', done => {
    uuid.mockImplementation(() => '893b17bc-5369-4ca1-a6aa-579f2f5cb318');

    request(app)
      .patch('/patient-demographics/9442964410')
      .send({
        serialChangeNumber: '123',
        pdsId: 'cppz'
      })
      .expect(res => {
        expect(res.status).toBe(503);
        expect(res.body.errors).toBe('Unexpected Error - HTTP code: 503');
      })
      .end(done);
  });
});
