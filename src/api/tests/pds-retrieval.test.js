import request from 'supertest';
import app from '../../app';
import { updateLogEvent } from '../../middleware/logging';

jest.mock('../../config/logging');

jest.mock('../../middleware/logging', () => mockLoggingMiddleware());
jest.mock('express-winston', () => mockExpressWinston());

function mockLoggingMiddleware() {
  const original = jest.requireActual('../../middleware/logging');
  return {
    ...original,
    updateLogEvent: jest.fn(),
    updateLogEventWithError: jest.fn()
  };
}

function mockExpressWinston() {
  return {
    errorLogger: () => (req, res, next) => next(),
    logger: () => (req, res, next) => next()
  };
}

function generateLogEvent(message) {
  return {
    status: 'validation-failed',
    validation: {
      errors: message,
      status: 'failed'
    }
  };
}

describe('/pds-retrieval/:nhsNumber', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 401 (Unauthorised) if Authorization header is not provided and log event', done => {
    request(app)
      .get('/pds-retrieval/9999999999')
      .expect(401)
      .expect(() => {
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith({
          status: 'authorization-failed',
          error: { message: 'Authorization header not provided' }
        });
      })
      .end(done);
  });

  it('should return a 403 (Unauthorised) if Authorization header value is incorrect and log event', done => {
    request(app)
      .get('/pds-retrieval/9999999999')
      .set({ Authorization: 'wrong' })
      .expect(403)
      .expect(() => {
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith({
          status: 'authorization-failed',
          error: { message: 'Authorization header value is not a valid authorization key' }
        });
      })
      .end(done);
  });

  it('should return a 200 if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
    request(app)
      .get('/pds-retrieval/9999999999')
      .set('Authorization', 'correct-key')
      .expect(200)
      .end(done);
  });

  it('should return an error if :nhsNumber is less than 10 digits', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
    request(app)
      .get('/pds-retrieval/99')
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

  it('should return an error if :nhsNumber is not numeric', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not numeric" }];
    request(app)
      .get('/pds-retrieval/xxxxxxxxxx')
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
