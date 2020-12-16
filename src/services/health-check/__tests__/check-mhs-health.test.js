import { mockChannel } from '../../../__mocks__/stompit';
import { connectToQueue } from '../../queue/helper/connect-to-queue';
import { checkMHSHealth } from '../check-mhs-health';

const mockErrorResponse = 'Error: exhausted connection failover';

jest.mock('../../../config/', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613'],
    queueUsername: 'guest',
    queuePassword: 'guest',
    queueVirtualHost: '/'
  })
}));
jest.mock('../../queue/helper/connect-to-queue');

describe('queue', () => {
  describe('checkMHSHealth', () => {
    beforeEach(() => {
      connectToQueue.mockImplementation(callback =>
        callback(false, { ...mockChannel, disconnect: jest.fn() })
      );
    });

    it('should return writable true if it can connect and write to MHS queue', () => {
      return checkMHSHealth().then(result => {
        return expect(result).toStrictEqual(getExpectedResults(true));
      });
    });

    it('should return writable false with an error if it can not connect to MHS', () => {
      connectToQueue.mockImplementation(callback => callback(mockErrorResponse));

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
