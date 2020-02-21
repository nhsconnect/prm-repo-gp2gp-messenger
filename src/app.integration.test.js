import request from 'supertest';
import app from './app';

jest.mock('express-winston', () => ({
  errorLogger: () => (req, res, next) => next(),
  logger: () => (req, res, next) => next()
}));

jest.mock('./config/logging');

describe('app', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
  });

  describe('GET /', () => {
    it('should return a 404 status code', done => {
      request(app)
        .get('/')
        .expect(404)
        .end(done);
    });
  });

  describe('GET /any-text - an unspecified endpoint', () => {
    it('should return a 404 status code', done => {
      request(app)
        .get('/any-text')
        .expect(404)
        .end(done);
    });

    describe('Swagger Documentation', () => {
      it('GET /swagger - should return a 301 status code (redirect) and text/html content type response', done => {
        request(app)
          .get('/swagger')
          .expect(301)
          .expect('Content-Type', 'text/html; charset=UTF-8')
          .end(done);
      });

      it('GET /swagger/index.html - should return a 200 status code and text/html content type response', done => {
        request(app)
          .get('/swagger/index.html')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=UTF-8')
          .end(done);
      });
    });
  });

  describe('GET /pds-retrieval', () => {
    it('should return a 200 status code for /pds-retrieval/:nhsNumber', done => {
      request(app)
        .get('/pds-retrieval/9999999999')
        .set('Authorization', 'correct-key')
        .expect(200)
        .end(done);
    });

    it('should return a 404 status code without nhsNumber parameter', done => {
      request(app)
        .get('/pds-retrieval')
        .expect(404)
        .end(done);
    });
  });
});
