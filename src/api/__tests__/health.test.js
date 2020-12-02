import request from 'supertest';
import app from '../../app';
import { logEvent, logError } from '../../middleware/logging';
import { getHealthCheck } from '../../services/health-check/get-health-check';

jest.mock('../../config/logging');
jest.mock('../../services/health-check/get-health-check');
jest.mock('../../middleware/logging');
const mockErrorResponse = 'Error: An error has occurred';

// Mocked so need to get real for expectedHealthCheckBase ??
describe('GET /health', () => {
  it('should return 200 and the response from getHealthCheck', done => {
    getHealthCheck.mockReturnValue(Promise.resolve(expectedHealthCheckBase(true)));

    request(app)
      .get('/health')
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual(expectedHealthCheckBase(true));
      })
      .end(done);
  });

  it('should call health check service with no parameters', done => {
    getHealthCheck.mockReturnValue(Promise.resolve(expectedHealthCheckBase(true)));

    request(app)
      .get('/health')
      .expect(() => {
        expect(getHealthCheck).toHaveBeenCalledTimes(1);
      })
      .end(done);
  });

  it('should return 503 status if mhs writable is false', done => {
    getHealthCheck.mockReturnValue(Promise.resolve(expectedHealthCheckBase(false)));

    request(app)
      .get('/health')
      .expect(503)
      .expect(() => {
        expect(logEvent).toHaveBeenCalledWith(
          'Health check failed',
          expectedHealthCheckBase(false)
        );
      })
      .end(done);
  });

  it('should return 500 if getHealthCheck if it cannot provide a healthcheck', done => {
    getHealthCheck.mockReturnValue(Promise.resolve(new Error('')));

    request(app)
      .get('/health')
      .expect(500)
      .expect(() => {
        expect(logError).toHaveBeenCalledTimes(1);
      })
      .end(done);
  });

  it('should update the logError for any unexpected error', done => {
    getHealthCheck.mockRejectedValue(expectedHealthCheckBase(true));

    request(app)
      .get('/health')
      .expect(() => {
        expect(logError).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledWith('Health check error', expectedHealthCheckBase(true));
      })
      .end(done);
  });
});

const expectedHealthCheckBase = mhs_connected => ({
  version: '1',
  description: 'Health of GP2GP Adapter service',
  node_env: process.env.NODE_ENV,
  details: {
    mhs: getExpectedResults(mhs_connected)
  }
});

const getExpectedResults = isWritable => {
  const baseConf = {
    options: {},
    headers: {},
    connected: false
  };
  return !isWritable
    ? {
        ...baseConf,
        headers: {},
        error: mockErrorResponse
      }
    : {
        ...baseConf,
        connected: true
      };
};
