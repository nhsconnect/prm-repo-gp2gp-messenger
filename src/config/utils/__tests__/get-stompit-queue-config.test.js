import config from '../../';
import { getStompitQueueConfig } from '../get-stompit-queue-config';

const originalConfig = { ...config };

describe('getStompitQueueConfig', () => {
  const hosts = [
    {
      host: 'mq-1',
      port: '61613',
      ssl: false,
      connectHeaders: { login: 'guest', passcode: 'guest', host: '/' }
    },
    {
      host: 'mq-2',
      port: '61613',
      ssl: false,
      connectHeaders: { login: 'guest', passcode: 'guest', host: '/' }
    }
  ];

  const mockQueueUrls = ['tcp://mq-1:61613', 'tcp://mq-2:61613'];

  beforeEach(() => {
    config.queueUrls = mockQueueUrls;
    config.queueUsername = 'guest';
    config.queuePassword = 'guest';
    config.queueVirtualHost = '/';
  });

  afterEach(() => {
    config.queueUrls = originalConfig.queueUrls;
    config.queueUsername = originalConfig.queueUsername;
    config.queuePassword = originalConfig.queuePassword;
    config.queueVirtualHost = originalConfig.queueVirtualHost;
  });

  it('should output an array that is the same length as config queueUrls', () => {
    expect(Array.isArray(getStompitQueueConfig())).toBe(true);
    expect(getStompitQueueConfig().length).toEqual(hosts.length);
  });

  it('should correctly format the config to match stompit config requirements', () => {
    expect(getStompitQueueConfig()).toEqual(hosts);
  });

  it('should remove any empty urls from config.queueUrls before parsing', () => {
    config.queueUrls = ['tcp://mq-1:61613', ''];
    expect(getStompitQueueConfig()).toEqual([hosts[0]]);
  });

  it('should return an empty array if there are no queueUrls defined in config', () => {
    config.queueUrls = ['', ''];
    expect(getStompitQueueConfig()).toEqual([]);
  });
});
