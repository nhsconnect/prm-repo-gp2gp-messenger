import request from 'supertest';
import app from '../../../app';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import MhsError from '../../../services/mhs/mhs-error';
import sendEhrRequest from '../send-ehr-request';

jest.mock('../send-ehr-request');
jest.mock('../../../services/health-check/get-health-check');
jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');

describe('POST /ehr-request', () => {
  const validRequestBody = { nhsNumber: 'some-nhs-number', odsCode: 'some-odsCode' };

  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';
    sendEhrRequest.mockResolvedValue();
  });

  afterEach(() => {
    if (process.env.AUTHORIZATION_KEYS) {
      delete process.env.AUTHORIZATION_KEYS;
    }
  });

  it('should return a 202 status code', done => {
    request(app)
      .post('/ehr-request')
      .send(validRequestBody)
      .expect(202)
      .end(done);
  });

  it('should return a 422 and error when NHS number was not provided', done => {
    request(app)
      .post('/ehr-request')
      .send({ odsCode: 'some-odsCode' })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({ errors: [{ nhsNumber: 'Invalid value' }] });
      })
      .end(done);
  });

  it('should update log event when NHS number was not provided', done => {
    request(app)
      .post('/ehr-request')
      .send({ odsCode: 'some-odsCode' })
      .expect(() => {
        expect(updateLogEvent).toHaveBeenCalledWith({
          status: 'validation-failed',
          validation: { status: 'failed', errors: [{ nhsNumber: 'Invalid value' }] }
        });
      })
      .end(done);
  });

  it('should return a 422 and error when ODS code was not provided', done => {
    request(app)
      .post('/ehr-request')
      .send({ nhsNumber: 'some-nhs-number' })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({ errors: [{ odsCode: 'Invalid value' }] });
      })
      .end(done);
  });

  it('should update log event when ODS code was not provided', done => {
    request(app)
      .post('/ehr-request')
      .send({ nhsNumber: 'some-nhs-number' })
      .expect(() => {
        expect(updateLogEvent).toHaveBeenCalledWith({
          status: 'validation-failed',
          validation: { status: 'failed', errors: [{ odsCode: 'Invalid value' }] }
        });
      })
      .end(done);
  });

  it('should return a 503 when sending the EHR request is unsuccessful', done => {
    sendEhrRequest.mockRejectedValue(new MhsError('there was an error!'));

    request(app)
      .post('/ehr-request')
      .send(validRequestBody)
      .expect(503)
      .expect(res => {
        expect(res.body).toEqual({ error: 'there was an error!' });
      })
      .end(done);
  });

  it('should update the log event when sending the EHR request is unsuccessful', done => {
    sendEhrRequest.mockRejectedValue(new MhsError('there was an error!'));

    request(app)
      .post('/ehr-request')
      .send(validRequestBody)
      .expect(() => {
        expect(updateLogEventWithError).toHaveBeenCalledWith(Error('there was an error!'));
      })
      .end(done);
  });

  it('should return a 500 for any unexpected error', done => {
    sendEhrRequest.mockRejectedValue(new Error('there was an error!'));

    request(app)
      .post('/ehr-request')
      .send(validRequestBody)
      .expect(500)
      .expect(res => {
        expect(res.body).toEqual({ error: 'there was an error!' });
      })
      .end(done);
  });

  it('should update the log event for any unexpected error', done => {
    sendEhrRequest.mockRejectedValue(new Error('there was an error!'));

    request(app)
      .post('/ehr-request')
      .send(validRequestBody)
      .expect(() => {
        expect(updateLogEventWithError).toHaveBeenCalledWith(Error('there was an error!'));
      })
      .end(done);
  });
});
