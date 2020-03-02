import config from '../../';
import { generateQueueConfig } from '../generate-queue-config';

const originalConfig = { ...config };

describe('generateQueueConfig', () => {
  const hosts = [
    {
      host: 'mq-1',
      port: '61613',
      ssl: false,
      username: 'guest',
      password: 'guest',
      vhost: '/'
    },
    {
      host: 'mq-2',
      port: '61613',
      ssl: false,
      username: 'guest',
      password: 'guest',
      vhost: '/'
    }
  ];

  const mockQueueName = 'Mock Queue Name';
  const mockQueueUrls = ['tcp://mq-1:61613', 'tcp://mq-2:61613'];

  beforeEach(() => {
    config.queueUsername = 'guest';
    config.queuePassword = 'guest';
    config.queueVirtualHost = '/';
    config.queueName = mockQueueName;
  });

  afterEach(() => {
    config.queueUsername = originalConfig.queueUsername;
    config.queuePassword = originalConfig.queuePassword;
    config.queueVirtualHost = originalConfig.queueVirtualHost;
    config.queueName = originalConfig.queueName;
  });

  it(`should create the queue config from host URL ${mockQueueUrls[0]}`, () => {
    expect(generateQueueConfig(mockQueueUrls[0])).toEqual(hosts[0]);
  });

  it(`should create the queue config from URL ${mockQueueUrls[1]}`, () => {
    expect(generateQueueConfig(mockQueueUrls[1])).toEqual(hosts[1]);
  });

  it('should throw an Error if the url is not of the format protocol://host:port', () => {
    expect(() => generateQueueConfig('protocol://host')).toThrowError(
      'Queue url protocol://host should have the format protocol://host:port'
    );
  });
});
