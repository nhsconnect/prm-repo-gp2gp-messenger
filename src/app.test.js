import request from 'supertest';
import app from './app';

jest.mock('express-winston', () => ({
  errorLogger: () => (req, res, next) => next(),
  logger: () => (req, res, next) => next()
}));

describe('app', () => {
  describe('GET /health', () => {
    it('should return a 200 status code', done => {
      request(app)
        .get('/health')
        .expect(200)
        .end(done);
    });
  });

  describe('POST /ehr-request', () => {
    beforeEach(() => {
      process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
    });

    it('should return a 202 status code', done => {
      request(app)
        .post('/ehr-request')
        .set('Authorization', 'correct-key')
        .expect(202)
        .end(done);
    });

    it('should return a 401 when no authorization header provided', done => {
      request(app)
        .post('/ehr-request')
        .expect(401)
        .end(done);
    });

    it('should return a 403 when authorization key is incorrect', done => {
      request(app)
        .post('/ehr-request')
        .set('Authorization', 'incorrect-key')
        .expect(403)
        .end(done);
    });
  });
});
