import request from 'supertest';
import app from '../app';
import sendEhrRequest from '../services/ehr-request';
import { getHealthCheck } from '../services/get-health-check';

jest.mock('../services/ehr-request');
jest.mock('../config/logging');
jest.mock('../services/get-health-check');
jest.mock('../middleware/auth');

describe('app', () => {
  describe('GET /health', () => {
    beforeEach(() => {
      getHealthCheck.mockReturnValue(
        Promise.resolve({
          details: {
            filestore: {
              available: true,
              writable: true
            },
            mhs: {
              connected: true
            }
          }
        })
      );
    });

    it('should return a 200 status code', done => {
      request(app)
        .get('/health')
        .expect(200)
        .end(done);
    });
  });

  describe('POST /ehr-request', () => {
    const validRequestBody = { nhsNumber: 'some-nhs-number', odsCode: 'some-odsCode' };

    beforeEach(() => {
      sendEhrRequest.mockResolvedValue();
    });

    it('should return a 202 status code', done => {
      request(app)
        .post('/ehr-request')
        .send(validRequestBody)
        .expect(202)
        .end(done);
    });
  });
});
