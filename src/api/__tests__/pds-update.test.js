import request from 'supertest';
import app from '../../app';
import { updateLogEvent } from '../../middleware/logging';

jest.mock('../../config/logging');
jest.mock('../../middleware/logging');

function generateLogEvent(message) {
  return {
    status: 'validation-failed',
    validation: {
      errors: message,
      status: 'failed'
    }
  };
}

describe('POST /patient/:nhsNumber/ods/:odsCode', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
  });

  it('should return a 200 if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
    request(app)
      .post('/pds-update/137/cppz/9442964410')
      .set('Authorization', 'correct-key')
      .expect(200)
      .end(done);
  });
  it('should return a 401 when no authorization header provided', done => {
    request(app)
      .post('/pds-update/137/cppz/9442964410')
      .expect(401)
      .end(done);
  });
  it('should return a 403 when authorization key is incorrect', done => {
    request(app)
      .post('/pds-update/137/cppz/9442964410')
      .set('Authorization', 'incorrect-key')
      .expect(403)
      .end(done);
  });
  it('should return an error if :nhsNumber is less than 10 digits', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
    request(app)
      .post('/pds-update/137/cppz/944410')
      .set('Authorization', 'correct-key')
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
});
