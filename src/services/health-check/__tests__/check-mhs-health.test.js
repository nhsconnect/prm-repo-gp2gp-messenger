import { connect } from 'stompit';
import config from '../../../config/index';
import { checkMHSHealth } from '../check-mhs-health';

const mockErrorResponse = 'Error: exhausted connection failover';

const originalConfig = { ...config };

describe('queue', () => {
  describe('checkMHSHealth', () => {
    afterEach(() => {
      config.queueUrls = originalConfig.queueUrls;
      config.queueUsername = originalConfig.queueUsername;
      config.queuePassword = originalConfig.queuePassword;
      config.queueVirtualHost = originalConfig.queueVirtualHost;
    });

    beforeEach(() => {
      config.queueUrls = ['tcp://mq-1:61613', 'tcp://mq-2:61613'];
      config.queueUsername = 'guest';
      config.queuePassword = 'guest';
      config.queueVirtualHost = '/';
    });

    it('should return writable true if it can connect and write to MHS queue', () => {
      return checkMHSHealth().then(result => {
        return expect(result).toStrictEqual(getExpectedResults(true));
      });
    });

    it('should return writable false with an error if it can not connect to MHS', () => {
      connect.mockImplementation(callback => callback(mockErrorResponse));

      return checkMHSHealth().then(result => {
        return expect(result).toStrictEqual(getExpectedResults(false));
      });
    });
  });
});

export const getExpectedResults = isWritable => {
  const baseConf = {
    options: {
      connectHeaders: { host: '/', login: 'guest', passcode: '*****' },
      host: 'mq-1',
      port: '61613',
      ssl: false
    },
    headers: {
      'heart-beat': '0,0',
      server: 'RabbitMQ/3.7.8',
      session: 'session/aAS4hrR',
      version: '1.2'
    },
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
