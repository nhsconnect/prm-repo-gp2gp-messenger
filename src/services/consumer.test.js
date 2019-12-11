import { ConnectFailover } from 'stompit';
import initialiseConsumer from './consumer';
import config from '../config';
import handleMessage from './message-handler';

jest.mock('stompit');
jest.mock('../config/logging');
jest.mock('./message-handler');

describe('initialiseConsumer', () => {
  const queue = { connect: jest.fn(), on: () => {} };
  const client = { subscribe: jest.fn(), send: jest.fn() };
  const message = { readString: jest.fn(), pipe: jest.fn(), ack: jest.fn(), nack: jest.fn() };
  const frame = { write: jest.fn(), end: jest.fn() };

  beforeEach(() => {
    config.queueUrl1 = 'stomp+ssl://some-url:some-port';
    config.queueUrl2 = 'tcp://other-url:other-port';
    config.queueUsername = 'some-username';
    config.queuePassword = 'some-password';

    jest.clearAllMocks();

    client.send.mockReturnValue(frame);
    message.readString.mockImplementation((encoding, callback) =>
      callback(null, 'some-message-body')
    );
    client.subscribe.mockImplementation((config, callback) => callback(null, message));
    queue.connect.mockImplementation(callback => callback(null, client));
    ConnectFailover.mockImplementation(() => queue);

    handleMessage.mockResolvedValue();
  });

  it('should connect to the broker with the correct config', () => {
    initialiseConsumer();

    expect(ConnectFailover).toHaveBeenCalledWith(
      [
        {
          connectHeaders: {
            login: 'some-username',
            passcode: 'some-password'
          },
          host: 'some-url',
          port: 'some-port',
          ssl: true
        },
        {
          connectHeaders: {
            login: 'some-username',
            passcode: 'some-password'
          },
          host: 'other-url',
          port: 'other-port',
          ssl: false
        }
      ],
      { maxReconnects: 10 }
    );
  });

  it('should throw if the queue urls are not configured correctly', () => {
    config.queueUrl1 = 'some-url-without-protocol:some-port';

    expect(() => initialiseConsumer()).toThrow(
      new Error('Queue url should have the format protocol://host:port')
    );
  });

  it('should throw when there is an error connecting to the broker', () => {
    const error = new Error('some-error-happened');
    queue.connect.mockImplementation(callback => callback(error));

    return expect(() => initialiseConsumer()).toThrow(error);
  });

  it('should subscribe to the queue with the correct config', () => {
    initialiseConsumer();
    expect(client.subscribe).toHaveBeenCalledWith(
      { destination: config.queueName },
      expect.anything()
    );
  });

  it('should put the message on dlq when there is an error subscribing to the queue', () => {
    const error = new Error('some-error-happened');
    client.subscribe.mockImplementation((config, callback) => callback(error, message));

    initialiseConsumer();

    expect(client.send).toHaveBeenCalledWith({
      destination: config.dlqName,
      errorMessage: error.message,
      stackTrace: error.stack
    });
    expect(message.pipe).toHaveBeenCalledWith(frame);
  });

  it('should throw when there is an error subscribing to the queue but no message', () => {
    const error = new Error('some-error-happened');
    client.subscribe.mockImplementation((config, callback) => callback(error));

    expect(() => initialiseConsumer()).toThrow(error);
  });

  it('should read the message from the queue with the correct encoding', () => {
    initialiseConsumer();
    expect(message.readString).toHaveBeenCalledWith('UTF-8', expect.anything());
  });

  it('should put the message stream on dlq when there is an error reading the message', () => {
    const error = new Error('some-error-happened');
    message.readString.mockImplementation((encoding, callback) => callback(error));

    initialiseConsumer();

    expect(client.send).toHaveBeenCalledWith({
      destination: config.dlqName,
      errorMessage: error.message,
      stackTrace: error.stack
    });
    expect(message.pipe).toHaveBeenCalledWith(frame);
  });

  it('should put the message body on dlq when there is an error reading the message', () => {
    const error = new Error('some-error-happened');
    message.readString.mockImplementation((encoding, callback) =>
      callback(error, 'some-message-body')
    );

    initialiseConsumer();

    expect(client.send).toHaveBeenCalledWith({
      destination: config.dlqName,
      errorMessage: error.message,
      stackTrace: error.stack
    });
    expect(frame.write).toHaveBeenCalledWith('some-message-body');
    expect(frame.end).toHaveBeenCalled();
  });

  it('should pass the message to the handler', () => {
    initialiseConsumer();
    expect(handleMessage).toHaveBeenCalledWith('some-message-body');
  });

  it('should acknowledge the message after handling', done => {
    initialiseConsumer();

    setImmediate(() => {
      expect(message.ack).toHaveBeenCalled();
      done();
    });
  });

  it('should put the message on the DLQ if handling the message fails', done => {
    const error = new Error('handling message failed');
    handleMessage.mockRejectedValue(error);

    initialiseConsumer();

    setImmediate(() => {
      expect(client.send).toHaveBeenCalledWith({
        destination: config.dlqName,
        errorMessage: error.message,
        stackTrace: error.stack
      });
      expect(frame.write).toHaveBeenCalledWith('some-message-body');
      expect(frame.end).toHaveBeenCalled();
      done();
    });
  });

  it('should send a negative acknowledgement if handling the message fails', done => {
    const error = new Error('handling message failed');
    handleMessage.mockRejectedValue(error);

    initialiseConsumer();

    setImmediate(() => {
      expect(message.nack).toHaveBeenCalled();
      done();
    });
  });
});
