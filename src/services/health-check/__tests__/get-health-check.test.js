import { S3 } from 'aws-sdk';
import { connect } from 'stompit';
import { getHealthCheck } from '../get-health-check';

jest.mock('aws-sdk');
jest.mock('aws-sdk');
jest.mock('../../../config/logging');
jest.mock('../../../config/', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613'],
    queueUsername: 'guest',
    queuePassword: 'guest',
    queueVirtualHost: '/'
  })
}));
jest.mock('../../../middleware/logging');

const mockErrorResponse = 'Error: exhausted connection failover';

describe('get-health-check', () => {
  const mockPutObject = jest.fn().mockImplementation((config, callback) => callback());
  const mockDeleteObject = jest.fn().mockImplementation((config, callback) => callback());
  const mockHeadBucket = jest.fn().mockImplementation((config, callback) => callback());

  beforeEach(() => {
    S3.mockImplementation(() => ({
      putObject: mockPutObject,
      deleteObject: mockDeleteObject,
      headBucket: mockHeadBucket
    }));
  });

  describe('getHealthCheck', () => {
    it('should resolve when both checks are ok', () => {
      connect.mockImplementation(callback => callback(false, mockClient));
      return getHealthCheck().then(result => {
        return expect(result).toStrictEqual(expectedHealthCheckBase(true));
      });
    });

    it('should resolve when s3 is not ok', () => {
      connect.mockImplementation((config, callback) => callback(mockErrorResponse));
      connect.mockImplementation(callback => callback(false, mockClient));

      return getHealthCheck().then(result => {
        return expect(result).toStrictEqual(expectedHealthCheckBase(true));
      });
    });

    it('should resolve when MHS is not ok', () => {
      connect.mockImplementation((config, callback) => callback());
      connect.mockImplementation(callback => callback(mockErrorResponse, null));

      return getHealthCheck().then(result => {
        return expect(result).toStrictEqual(expectedHealthCheckBase(false));
      });
    });
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

const mockHeadersResponse = {
  'heart-beat': '0,0',
  server: 'RabbitMQ/3.7.8',
  session: 'session/aAS4hrR',
  version: '1.2'
};

const mockOptionsResponse = {
  connectHeaders: { host: '/', login: 'guest', passcode: '*****' },
  host: 'mq-1',
  port: '61613',
  ssl: false
};

const getExpectedResults = isWritable => {
  const baseConf = {
    options: mockOptionsResponse,
    headers: mockHeadersResponse,
    connected: isWritable
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

const mockClient = {
  headers: mockHeadersResponse,
  _options: mockOptionsResponse,
  disconnect: jest.fn()
};
