import axios from 'axios';
import request from 'supertest';
import app from '../app';
import { pdsResponseAck } from '../services/pds/pds-responses/pds-response-ack';
import { pdsQeuryFailedAE } from '../services/pds/pds-responses/pds-response-nack-AE';

jest.mock('../config/logging');
jest.mock('axios');

describe('app', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
    axios.post.mockImplementation(() => Promise.resolve({ status: 200, data: pdsResponseAck() }));
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

    it('should return the response body with Errors for /patient-demographics/:nhsNumber', done => {
      axios.post.mockImplementation(() =>
        Promise.resolve({ status: 200, data: pdsQeuryFailedAE() })
      );
      request(app)
        .get('/patient-demographics/9999999999')
        .set('Authorization', 'correct-key')
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              errors: ['Error in processing the patient retrieval request']
            })
          );
        })
        .end(done);
    });

    it('should return a 404 status code without nhsNumber parameter', done => {
      request(app)
        .get('/patient-demographics')
        .expect(404)
        .end(done);
    });
  });
});
