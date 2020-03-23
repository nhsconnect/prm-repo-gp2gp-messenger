import request from 'supertest';
import app from '../../../app';
jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');

describe('POST /health-record-requests/:nhsNumber', () => {
  it('should return a 200', done => {
    request(app)
      .post('/health-record-requests/1234567890')
      .expect(200)
      .end(done);
  });
});
