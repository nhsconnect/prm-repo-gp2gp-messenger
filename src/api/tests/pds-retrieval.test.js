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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error if :nhsNumber is less than 10 digits', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
    request(app)
      .get('/pds-retrieval/99')
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

  it('should return a 200 if :nhsNumber is numeric and 10 digits', done => {
    request(app)
      .get('/pds-retrieval/9999999999')
      .expect(200)
      .end(done);
  });
});
