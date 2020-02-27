import { getHealthCheck } from '../get-health-check';
import config from '../../config';
import { S3 } from 'aws-sdk';
import { ConnectFailover } from 'stompit';

jest.mock('stompit');
jest.mock('aws-sdk');
jest.mock('aws-sdk');
jest.mock('../../config/logging');
jest.mock('../../middleware/logging');

const mockStompit = (on, connect) => {
  ConnectFailover.mockImplementation(() => ({
    on,
    connect
  }));
};
const mockOn = jest.fn();
const mockConnect = jest.fn();
const mockPutObject = jest.fn().mockImplementation((config, callback) => callback());
const mockDeleteObject = jest.fn().mockImplementation((config, callback) => callback());
const mockHeadBucket = jest.fn().mockImplementation((config, callback) => callback());
const mockErrorResponse = 'Error: exhausted connection failover';

describe('get-health-check', () => {
  afterAll(() => {
    config.queueUrl1 = process.env.MHS_QUEUE_URL_1;
    config.queueUrl2 = process.env.MHS_QUEUE_URL_2;
    config.queueUsername = process.env.MHS_QUEUE_USERNAME;
    config.queuePassword = process.env.MHS_QUEUE_PASSWORD;
    config.stompVirtualHost = process.env.MHS_STOMP_VIRTUAL_HOST;
  });

  beforeEach(() => {
    config.queueUrl1 = 'tcp://mq-1:61613';
    config.queueUrl2 = 'tcp://mq-2:61613';
    config.queueUsername = 'guest';
    config.queuePassword = 'guest';
    config.stompVirtualHost = '/';

    S3.mockImplementation(() => ({
      putObject: mockPutObject,
      deleteObject: mockDeleteObject,
      headBucket: mockHeadBucket
    }));

    mockStompit(mockOn, mockConnect);
  });

  describe('getHealthCheck', () => {
    it('should resolve when both checks are ok', () => {
      mockConnect.mockImplementation(callback => callback(false, mockClient));
      return getHealthCheck().then(result => {
        return expect(result).toStrictEqual(expectedHealthCheckBase(true));
      });
    });

    it('should resolve when s3 is not ok', () => {
      mockPutObject.mockImplementation((config, callback) => callback(mockErrorResponse));
      mockConnect.mockImplementation(callback => callback(false, mockClient));

      return getHealthCheck().then(result => {
        return expect(result).toStrictEqual(expectedHealthCheckBase(true));
      });
    });

    it('should resolve when MHS is not ok', () => {
      mockPutObject.mockImplementation((config, callback) => callback());
      mockConnect.mockImplementation(callback => callback(mockErrorResponse, null));

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
