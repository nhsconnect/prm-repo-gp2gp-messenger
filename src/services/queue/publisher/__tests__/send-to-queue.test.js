import { connect, ConnectFailover } from 'stompit';
import config from '../../../../config';
import { getStompitQueueConfig } from '../../../../config/utils/get-stompit-queue-config';
import { generateEhrExtractResponse } from '../../../../templates/soap/ehr-extract-template';
import { sendToQueue } from '../send-to-queue';

const originalConfig = { ...config };

describe('publisher', () => {
  afterEach(() => {
    config.queueUrls = originalConfig.queueUrls;
    config.queueUsername = originalConfig.queueUsername;
    config.queueName = originalConfig.queueName;
    config.queuePassword = originalConfig.queuePassword;
    config.queueVirtualHost = originalConfig.queueVirtualHost;
  });

  beforeEach(() => {
    config.queueUrls = ['tcp://localhost:61620', 'tcp://localhost:61621'];
    config.queueUsername = 'guest';
    config.queuePassword = 'guest';
    config.queueVirtualHost = '/';
    config.queueName = 'gp2gp-test';
  });

  describe('sendToQueue', () => {
    it('should connect to a queue', async done => {
      await sendToQueue(generateEhrExtractResponse());
      expect(ConnectFailover).toHaveBeenCalledTimes(1);
      expect(ConnectFailover).toHaveBeenCalledWith(getStompitQueueConfig(), expect.anything());
      done();
    });

    it('should return an error if client is unable to connect', () => {
      connect.mockImplementation(callback => callback('some-connection-error', null));
      return expect(sendToQueue('error')).rejects.toBe('some-connection-error');
    });
  });
});
