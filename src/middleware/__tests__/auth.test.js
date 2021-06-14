import request from 'supertest';
import { pdsRetrieval } from '../../api/patient-demographics/pds-retrieval';
import app from '../../app';
import { initializeConfig } from '../../config';
import { logInfo, logWarning } from '../logging';

jest.mock('../logging');
jest.mock('../../config');
jest.mock('../../api/patient-demographics/pds-retrieval');

// In all other unit tests we want to pass through all of this logic and should therefore call jest.mock
// jest.mock('../auth') will call the manual mock in __mocks__ automatically
describe('auth', () => {
  beforeEach(() => {
    pdsRetrieval.mockImplementation((req, res) => {
      res.sendStatus(201);
    });
    initializeConfig.mockReturnValue({
      consumerApiKeys: {
        TEST_USER: 'correct-key',
        DUPLICATE_TEST_USER: 'correct-key',
        USER_2: 'key_2'
      }
    });
  });

  describe('authenticated successfully', () => {
    it('should return HTTP 201 when correctly authenticated', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key')
        .expect(201)
        .end(done);
    });
  });

  describe('consumerApiKeys environment variables not provided', () => {
    it('should return 412 if consumerApiKeys have not been set', done => {
      initializeConfig.mockReturnValueOnce({ consumerApiKeys: {} });
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key')
        .expect(412)
        .end(done);
    });

    it('should return an explicit error message in the body if consumerApiKeys have not been set', done => {
      initializeConfig.mockReturnValueOnce({ consumerApiKeys: {} });
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Server-side Authorization keys have not been set, cannot authenticate'
            })
          );
        })
        .end(done);
    });
  });

  describe('Authorization header not provided', () => {
    it('should return HTTP 401 when no authorization header provided', done => {
      request(app).get('/patient-demographics/0000000000').expect(401).end(done);
    });

    it('should return an explicit error message in the body when no authorization header provided', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              error:
                'The request (/patient-demographics) requires a valid Authorization header to be set'
            })
          );
        })
        .end(done);
    });
  });

  describe('Incorrect Authorisation header value provided ', () => {
    it('should return HTTP 403 when authorization key is incorrect', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'incorrect-key')
        .expect(403)
        .end(done);
    });

    it('should return an explicit error message in the body when authorization key is incorrect', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'incorrect-key')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Authorization header is provided but not valid'
            })
          );
        })
        .end(done);
    });
  });

  describe('should only authenticate with exact value of the auth key', () => {
    it('should return HTTP 403 when authorization key is partial string', done => {
      initializeConfig.mockReturnValueOnce({
        consumerApiKeys: { TEST_USER: 'correct-key,other-key' }
      });
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key')
        .expect(403)
        .end(done);
    });

    it('should return HTTP 201 when authorization keys have a comma but are one string ', done => {
      initializeConfig.mockReturnValueOnce({
        consumerApiKeys: { TEST_USER: 'correct-key,other-key' }
      });
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key,other-key')
        .expect(201)
        .end(done);
    });
  });

  describe('Auth logging', () => {
    it('should log consumer, method and url for correctly authenticated request', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'key_2')
        .expect(() => {
          expect(logInfo).toHaveBeenCalledWith(
            'Consumer: USER_2, Request: GET /patient-demographics/0000000000'
          );
        })
        .end(done);
    });

    it('should log multiple consumers when they use the same key value', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key')
        .expect(() => {
          expect(logInfo).toHaveBeenCalledWith(
            'Consumer: TEST_USER/DUPLICATE_TEST_USER, Request: GET /patient-demographics/0000000000'
          );
        })
        .end(done);
    });

    it('should log the method, url and partial api key when a request is unsuccessful', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .send({ nhsNumber: '0000000000' })
        .set('Authorization', 'incorrect-key')
        .expect(403)
        .expect(() => {
          expect(logWarning).toHaveBeenCalledWith(
            'Unsuccessful Request: GET /patient-demographics/0000000000, API Key: ******key'
          );
        })
        .end(done);
    });
  });
});
