import { checkMHSHealth } from './queue';
import { ConnectFailover } from 'stompit';
import config from './index';

jest.mock('stompit');

const mockOn = jest.fn();
const mockConnect = jest.fn();

describe('queue', () => {
  describe('checkMHSHealth', () => {
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

      jest.clearAllMocks();
      mockStompit(mockOn, mockConnect);
    });

    it('should return writable true if it can connect and write to MHS queue', () => {
      mockConnect.mockImplementation(callback => callback(false, mockClient));

      return checkMHSHealth().then(result => {
        return expect(result).toStrictEqual(getExpectedResults(true));
      });
    });

    it('should return writable false with an error if it can not connect to MHS', () => {
      mockConnect.mockImplementation(callback => callback(mockErrorResponse));

      return checkMHSHealth().then(result => {
        return expect(result).toStrictEqual(getExpectedResults(false));
      });
    });
  });
});

export const getExpectedResults = isWritable => {
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

export const mockStompit = (on, connect) => {
  ConnectFailover.mockImplementation(() => ({
    on,
    connect
  }));
};

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

const mockErrorResponse = 'Error: exhausted connection failover';

export const mockClient = {
  headers: mockHeadersResponse,
  _options: mockOptionsResponse,
  disconnect: jest.fn()
};
