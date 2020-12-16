import { initializeConfig } from '../../';
import { generateHostsConfig } from '../generate-hosts-config';

jest.mock('../../');

describe('generateHostsConfig', () => {
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

  const mockQueueUrls = ['tcp://mq-1:61613', 'tcp://mq-2:61613'];
  const mockQueueUrlsMissingFirst = ['', 'tcp://mq-2:61613'];
  initializeConfig.mockReturnValue({
    queueUrls: mockQueueUrls,
    queueUsername: 'guest',
    queuePassword: 'guest',
    queueVirtualHost: '/'
  });

  it('should throw an error if input is not an array', () => {
    expect(() => generateHostsConfig()).toThrowError(
      'generateHostsConfig input must be an array of queue URLs'
    );
  });

  it('should not throw an error if input is an array', () => {
    expect(() => generateHostsConfig([])).not.toThrowError();
  });

  it('should return an array containing the generated queue config', () => {
    const result = generateHostsConfig([mockQueueUrls[0]]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([hosts[0]]);
  });

  it('should return an array containing the generated queue config if there are multiple inputs', () => {
    const result = generateHostsConfig(mockQueueUrls);
    expect(result).toEqual(hosts);
  });

  it('should throw an error if one of the inputs is an empty string', () => {
    expect(() => generateHostsConfig(mockQueueUrlsMissingFirst)).toThrowError(
      'Queue url  should have the format protocol://host:port'
    );
  });
});
