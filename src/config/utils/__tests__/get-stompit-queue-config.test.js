import { initializeConfig } from '../../';
import { getStompitQueueConfig } from '../get-stompit-queue-config';

jest.mock('../../');

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

  it('should output an array that is the same length as config queueUrls', () => {
    const mockQueueUrls = ['tcp://mq-1:61613', 'tcp://mq-2:61613'];
    initializeConfig.mockReturnValue({
      queueUrls: mockQueueUrls,
      queueUsername: 'guest',
      queuePassword: 'guest',
      queueVirtualHost: '/'
    });

    expect(Array.isArray(getStompitQueueConfig())).toBe(true);
    expect(getStompitQueueConfig().length).toEqual(hosts.length);
  });

  it('should correctly format the config to match stompit config requirements', () => {
    const mockQueueUrls = ['tcp://mq-1:61613', 'tcp://mq-2:61613'];
    initializeConfig.mockReturnValue({
      queueUrls: mockQueueUrls,
      queueUsername: 'guest',
      queuePassword: 'guest',
      queueVirtualHost: '/'
    });

    expect(getStompitQueueConfig()).toEqual(hosts);
  });

  it('should remove any empty urls from config.queueUrls before parsing', () => {
    const mockQueueUrls = ['tcp://mq-1:61613', ''];
    initializeConfig.mockReturnValue({
      queueUrls: mockQueueUrls,
      queueUsername: 'guest',
      queuePassword: 'guest',
      queueVirtualHost: '/'
    });

    expect(getStompitQueueConfig()).toEqual([hosts[0]]);
  });

  it('should return an empty array if there are no queueUrls defined in config', () => {
    const mockQueueUrls = ['', ''];
    initializeConfig.mockReturnValue({
      queueUrls: mockQueueUrls,
      queueUsername: 'guest',
      queuePassword: 'guest',
      queueVirtualHost: '/'
    });

    expect(getStompitQueueConfig()).toEqual([]);
  });
});
