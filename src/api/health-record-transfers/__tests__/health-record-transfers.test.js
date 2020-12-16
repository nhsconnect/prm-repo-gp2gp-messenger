import request from 'supertest';
import app from '../../../app';

describe('healthRecordRequests', () => {
  it('should return a 204', done => {
    request(app).post('/health-record-transfers').expect(204).end(done);
  });
});
