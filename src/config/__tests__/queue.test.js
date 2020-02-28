import { checkMHSHealth } from '../queue';
import { connect } from 'stompit';
import config from '../index';

const mockErrorResponse = 'Error: exhausted connection failover';

const originalConfig = { ...config };

describe('queue', () => {
  describe('checkMHSHealth', () => {
    afterEach(() => {
      config.queueUrl1 = originalConfig.queueUrl1;
      config.queueUrl2 = originalConfig.queueUrl2;
      config.queueUsername = originalConfig.queueUsername;
      config.queuePassword = originalConfig.queuePassword;
      config.stompVirtualHost = originalConfig.stompVirtualHost;
    });

    beforeEach(() => {
      config.queueUrl1 = 'tcp://mq-1:61613';
      config.queueUrl2 = 'tcp://mq-2:61613';
      config.queueUsername = 'guest';
      config.queuePassword = 'guest';
      config.stompVirtualHost = '/';
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
