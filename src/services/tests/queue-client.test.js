import { ConnectFailover } from 'stompit';
import config from '../../config';
import { generateHostsConfig, generateQueueConfig, QueueClient } from '../queue-client';

jest.mock('stompit');

const originalConfig = { ...config };

describe('class Queue', () => {
  const hosts = [
    {
      host: 'mq-1',
      port: '61613',
      ssl: false,
      connectHeaders: {
        login: 'guest',
        passcode: 'guest',
        host: '/'
      }
    },
    {
      host: 'mq-2',
      port: '61613',
      ssl: false,
      connectHeaders: {
        login: 'guest',
        passcode: 'guest',
        host: '/'
      }
    }
  ];

  // const queueConfig = { maxReconnects: 1, initialReconnectDelay: 100 };

  const mockConnect = jest.fn();

  const mockClient = {
    headers: {
      'heart-beat': '0,0',
      server: 'RabbitMQ/3.7.8',
      session: 'session/aAS4hrR',
      version: '1.2'
    },
    _options: {
      connectHeaders: { host: '/', login: 'guest', passcode: '*****' },
      host: 'mq-1',
      port: '61613',
      ssl: false
    },
    disconnect: jest.fn()
  };

  const mockQueueName = 'Mock Queue Name';
  const mockQueueUrls = ['tcp://mq-1:61613', 'tcp://mq-2:61613'];
  const mockQueueUrlsMissingFirst = ['', 'tcp://mq-2:61613'];

  beforeEach(() => {
    config.queueUrls = mockQueueUrls;
    config.queueUsername = 'guest';
    config.queuePassword = 'guest';
    config.stompVirtualHost = '/';
    config.queueName = mockQueueName;

    ConnectFailover.mockImplementation(() => ({
      on: jest.fn(),
      connect: mockConnect
    }));

    mockConnect.mockImplementation(callback => callback(false, mockClient));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    config.queueUrls = originalConfig.queueUrls;
    config.queuePassword = originalConfig.queuePassword;
    config.stompVirtualHost = originalConfig.stompVirtualHost;
    config.queueName = originalConfig.queueName;
  });

  it('should take queueName and set it', () => {
    const queueName = 'Queue Name';
    const queue = new QueueClient({ name: queueName });
    expect(queue.name).toBe(queueName);
  });

  it('should take the queueName from config and set it if no default name passed', () => {
    const queue = new QueueClient();
    expect(queue.name).toBe(mockQueueName);
  });

  it('should take an array of host URLs from config, format it and store it', () => {
    const queue = new QueueClient();
    expect(queue.hosts).toEqual(hosts);
  });

  it('should call stompit ConnectFailover with the host config', () => {
    const queue = new QueueClient()._connect;
    expect(ConnectFailover).toHaveBeenCalledTimes(1);
    expect(ConnectFailover).toHaveBeenCalledWith(hosts);
    expect(queue.client).toEqual(mockClient);
  });

  describe('generateQueueConfig', () => {
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

  describe('generateHostsConfig', () => {
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
});
