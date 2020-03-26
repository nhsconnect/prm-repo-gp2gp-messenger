import axios from 'axios';
import request from 'supertest';
import app from '../app';
import { pdsQueryActFailed } from '../services/pds/__tests__/data/pds-query-act-failed';
import { pdsRetrivealQueryResponseSuccess } from '../services/pds/__tests__/data/pds-retrieval-query-response-success';

jest.mock('../config/logging');
jest.mock('axios');

describe('app', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';
    axios.post.mockImplementation(() =>
      Promise.resolve({ status: 200, data: pdsRetrivealQueryResponseSuccess })
    );
  });

  afterEach(() => {
    if (process.env.AUTHORIZATION_KEYS) {
      delete process.env.AUTHORIZATION_KEYS;
    }
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

  describe('GET /patient-demographics', () => {
    it('should return a 200 status code for /patient-demographics/:nhsNumber', done => {
      request(app)
        .get('/patient-demographics/9999999999')
        .set('Authorization', 'correct-key')
        .expect(200)
        .end(done);
    });

    it('should return the response body for /patient-demographics/:nhsNumber', done => {
      request(app)
        .get('/patient-demographics/9999999999')
        .set('Authorization', 'correct-key')
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              conversationId: expect.anything(),
              data: {
                patientPdsId: 'cppz',
                serialChangeNumber: '138'
              }
            })
          );
        })
        .end(done);
    });

    it('should return a 503 status code with Errors for /patient-demographics/:nhsNumber', done => {
      axios.post.mockImplementation(() =>
        Promise.resolve({ status: 200, data: pdsQueryActFailed() })
      );
      request(app)
        .get('/patient-demographics/9999999999')
        .set('Authorization', 'correct-key')
        .expect(503)
        .end(done);
    });

    it('should return a 404 status code without nhsNumber parameter', done => {
      request(app)
        .get('/patient-demographics')
        .expect(404)
        .end(done);
    });
  });

  describe('POST /health-record-requests/:nhsNumber', () => {
    it('should return a 401 status code for /health-record-requests/:nhsNumber when not authenticated', done => {
      request(app)
        .post('/health-record-requests/9999999999')
        .expect(401)
        .end(done);
    });
  });
});
