import axios from 'axios';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import app from '../app';
import { pdsQueryActFailed } from '../services/pds/__tests__/data/pds-query-act-failed';
import { pdsRetrivealQueryResponseSuccess } from '../services/pds/__tests__/data/pds-retrieval-query-response-success';
import { getPracticeAsid } from '../services/mhs/mhs-route-client';

jest.mock('../middleware/logging');
jest.mock('axios');
jest.mock('../services/mhs/mhs-route-client');

describe('app', () => {
  beforeEach(() => {
    process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS = 'correct-key';
  });

  afterEach(() => {
    if (process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS) {
      delete process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS;
    }
  });

  describe('GET /', () => {
    it('should return a 404 status code', done => {
      request(app).get('/').expect(404).end(done);
    });
  });

  describe('GET /any-text - an unspecified endpoint', () => {
    it('should return a 404 status code', done => {
      request(app).get('/any-text').expect(404).end(done);
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
      axios.post.mockImplementation(() =>
        Promise.resolve({ status: 200, data: pdsRetrivealQueryResponseSuccess })
      );
      request(app)
        .get('/patient-demographics/9999999999')
        .set('Authorization', 'correct-key')
        .expect(200)
        .end(done);
    });

    it('should return the response body for /patient-demographics/:nhsNumber', done => {
      axios.post.mockImplementation(() =>
        Promise.resolve({ status: 200, data: pdsRetrivealQueryResponseSuccess })
      );
      request(app)
        .get('/patient-demographics/9999999999')
        .set('Authorization', 'correct-key')
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              data: {
                odsCode: 'B86041',
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
      request(app).get('/patient-demographics').expect(404).end(done);
    });
  });

  describe('POST /health-record-requests/:nhsNumber', () => {
    it('should return a 401 status code for /health-record-requests/:nhsNumber when not authenticated', done => {
      request(app).post('/health-record-requests/9999999999').expect(401).end(done);
    });
  });

  describe('POST /health-record-requests/:nhsNumber/acknowledgement', () => {
    const practiceAsid = '200007389';
    const mockBody = {
      conversationId: uuid(),
      messageId: uuid(),
      odsCode: 'B1234',
      repositoryAsid: '20000018274'
    };

    it('should successfully send acknowledgement and return 204', done => {
      getPracticeAsid.mockResolvedValue(practiceAsid);
      axios.post.mockResolvedValue({ status: 204 });

      request(app)
        .post('/health-record-requests/9999999999/acknowledgement')
        .set('Authorization', 'correct-key')
        .send(mockBody)
        .expect(204)
        .end(done);
    });

    it('should error when send message fails', done => {
      getPracticeAsid.mockResolvedValue(practiceAsid);
      axios.post.mockRejectedValue({ status: 500 });

      request(app)
        .post(`/health-record-requests/9999999999/acknowledgement`)
        .set('Authorization', 'correct-key')
        .send(mockBody)
        .expect(503)
        .end(done);
    });
  });
});
