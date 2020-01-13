import { checkMHSHealth } from './queue';
import { ConnectFailover } from 'stompit';

jest.mock('stompit');

const mockOn = jest.fn();
const mockConnect = jest.fn();

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

describe('queue', () => {
  describe('checkMHSHealth', () => {
    beforeEach(() => {
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
