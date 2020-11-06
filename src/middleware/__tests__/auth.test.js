import request from 'supertest';
import { pdsRetrieval } from '../../api/patient-demographics/pds-retrieval';
import app from '../../app';

jest.mock('../logging');
jest.mock('../../api/patient-demographics/pds-retrieval');

// In all other unit tests we want to pass through all of this logic and should therefore call jest.mock
// jest.mock('../auth') will call the manual mock in __mocks__ automatically
describe('auth', () => {
  beforeEach(() => {
    process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS = 'correct-key';
    pdsRetrieval.mockImplementation((req, res) => {
      res.sendStatus(201);
    });
  });

  afterEach(() => {
    if (process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS) {
      delete process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS;
    }
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

  describe('GP2GP_ADAPTOR_AUTHORIZATION_KEYS environment variables not provides', () => {
    beforeEach(() => {
      if (process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS) {
        delete process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS;
      }
    });

    it('should return 412 if GP2GP_ADAPTOR_AUTHORIZATION_KEYS have not been set', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key')
        .expect(412)
        .end(done);
    });

    it('should return an explicit error message in the body if GP2GP_ADAPTOR_AUTHORIZATION_KEYS have not been set', done => {
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

  describe('incorrect Authorisation header value provided ', () => {
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
    it('should return HTTP 403 when authorization key is incorrect', done => {
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'co')
        .expect(403)
        .end(done);
    });

    it('should return HTTP 403 when authorization key is partial string', done => {
      process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS = 'correct-key,other-key';
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key')
        .expect(403)
        .end(done);
    });

    it('should return HTTP 201 when authorization keys have a comma but are one string ', done => {
      process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS = 'correct-key,other-key';
      request(app)
        .get('/patient-demographics/0000000000')
        .set('Authorization', 'correct-key,other-key')
        .expect(201)
        .end(done);
    });
  });
});
