import httpContext from 'async-local-storage';
import { connect, ConnectFailover } from 'stompit';
import config from '../../config';
import logger from '../../config/logging';
import initialiseConsumer from '../consumer';
import handleMessage from '../message-handler';

httpContext.enable();

jest.mock('../../config/logging');
jest.mock('../message-handler');

const errorMessage = 'some-error-happened';

const mockTransaction = {
  send: jest.fn(),
  commit: jest.fn(),
  abort: jest.fn()
};

const client = {
  subscribe: jest.fn(),
  begin: jest.fn(),
  ack: jest.fn(),
  nack: jest.fn()
};

const message = { readString: jest.fn(), pipe: jest.fn() };

const originalConfig = { ...config };

describe('initialiseConsumer', () => {
  afterEach(() => {
    config.queueUrls = originalConfig.queueUrls;
    config.queueUsername = originalConfig.queueUsername;
    config.queuePassword = originalConfig.queuePassword;
    config.queueVirtualHost = originalConfig.queueVirtualHost;
  });

  beforeEach(() => {
    config.queueUrls = ['stomp+ssl://some-url:some-port', 'tcp://other-url:other-port'];
    config.queueUsername = 'some-username';
    config.queuePassword = 'some-password';
    config.queueVirtualHost = '/';

    message.readString.mockImplementation((encoding, callback) =>
      callback(null, 'some-message-body')
    );

    client.begin.mockReturnValue(mockTransaction);
    client.subscribe.mockImplementation((config, callback) => callback(null, message));

    connect.mockImplementation(callback => callback(null, client));

    handleMessage.mockResolvedValue();
  });

  it('should connect to the broker with the correct config', () => {
    initialiseConsumer();

    expect(ConnectFailover).toHaveBeenCalledWith(
      [connectionFailoverTemplate(true), connectionFailoverTemplate(false, 'other')],
      { maxReconnects: 1, initialReconnectDelay: 100 }
    );
  });

  it('should connect to the broker when there is no failover', () => {
    config.queueUrls = ['stomp+ssl://some-url:some-port'];

    initialiseConsumer();

    expect(ConnectFailover).toHaveBeenCalledWith([connectionFailoverTemplate(true)], {
      maxReconnects: 1,
      initialReconnectDelay: 100
    });
  });

  it('should throw if the queue urls are not configured correctly', () => {
    config.queueUrls[0] = 'some-url-without-protocol:some-port';

    expect(() => initialiseConsumer()).toThrow(
      new Error(
        'Queue url some-url-without-protocol:some-port should have the format protocol://host:port'
      )
    );
  });

  it('should throw when there is an error connecting to the broker', () => {
    connect.mockImplementation(callback => callback(new Error(errorMessage)));

    return expect(() => initialiseConsumer()).toThrow(new Error(errorMessage));
  });

  it('should subscribe to the queue with the correct config', () => {
    initialiseConsumer();

    expect(client.subscribe).toHaveBeenCalledWith(
      { destination: config.queueName, ack: 'client-individual' },
      expect.anything()
    );
  });

  it('should update the log event when there is an error subscribing to the queue', () => {
    client.subscribe.mockImplementation((config, callback) =>
      callback(new Error(errorMessage), message)
    );

    initialiseConsumer();

    expect(logger.info).toHaveBeenCalledWith('Event finished', errorMessageTemplate());
  });

  it('should throw when there is an error subscribing to the queue but no message', () => {
    client.subscribe.mockImplementation((config, callback) => callback(new Error(errorMessage)));

    expect(() => initialiseConsumer()).toThrow(new Error(errorMessage));
  });

  it('should read the message from the queue with the correct encoding', () => {
    initialiseConsumer();

    expect(message.readString).toHaveBeenCalledWith('UTF-8', expect.anything());
  });

  it('should update log event when there is an error reading the message', () => {
    message.readString.mockImplementation((encoding, callback) =>
      callback(new Error(errorMessage), 'some-message-body')
    );

    initialiseConsumer();

    expect(logger.info).toHaveBeenCalledWith('Event finished', errorMessageTemplate());
  });

  it('should pass the message to the handler', () => {
    initialiseConsumer();
    expect(handleMessage).toHaveBeenCalledWith('some-message-body');
  });

  it('should acknowledge the message after handling', done => {
    initialiseConsumer();

    setImmediate(() => {
      expect(client.ack).toHaveBeenCalled();
      done();
    });
  });

  it('should log the event after handling', done => {
    initialiseConsumer();

    setImmediate(() => {
      expect(logger.info).toHaveBeenCalledWith('Event finished', {
        event: {
          status: 'Message Handled',
          mhs: {
            mqMessageId: undefined
          }
        }
      });
      done();
    });
  });

  it('should send a negative acknowledgement if handling the message fails', done => {
    handleMessage.mockRejectedValue(new Error(errorMessage));

    initialiseConsumer();

    setImmediate(() => {
      expect(client.nack).toHaveBeenCalled();
      done();
    });
  });

  it('should log the error event if handling the message fails', done => {
    handleMessage.mockRejectedValue(new Error(errorMessage));

    initialiseConsumer();

    setImmediate(() => {
      expect(logger.info).toHaveBeenCalledWith('Event finished', errorMessageTemplate());
      done();
    });
  });
});

const errorMessageTemplate = () => ({
  event: {
    status: 'Consuming received message',
    error: {
      message: errorMessage,
      stack: expect.any(String)
    }
  }
});

const connectionFailoverTemplate = (isSSL, altPrefix = 'some') => ({
  connectHeaders: {
    login: 'some-username',
    passcode: 'some-password',
    host: '/'
  },
  host: `${altPrefix}-url`,
  port: `${altPrefix}-port`,
  ssl: isSSL
});
