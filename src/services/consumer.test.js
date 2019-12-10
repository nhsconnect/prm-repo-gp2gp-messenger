import { ConnectFailover } from 'stompit';
import initialiseConsumer from './consumer';
import config from '../config';
import handleMessage from './message-handler';

jest.mock('stompit');
jest.mock('../config/logging');
jest.mock('./message-handler', () => jest.fn().mockResolvedValue());

describe('initialiseConsumer', () => {
  const readString = jest.fn();
  const subscribe = jest.fn();
  const connect = jest.fn();

  beforeEach(() => {
    config.queueUrl1 = 'stomp+ssl://some-url:some-port';
    config.queueUrl2 = 'tcp://other-url:other-port';
    config.queueUsername = 'some-username';
    config.queuePassword = 'some-password';

    jest.clearAllMocks();

    readString.mockImplementation((encoding, callback) => callback(null, 'some-message-body'));
    subscribe.mockImplementation((config, callback) => callback(null, { readString }));
    connect.mockImplementation(callback => callback(null, { subscribe }));
    ConnectFailover.mockImplementation(() => ({ connect, on: () => {} }));
  });

  it('should connect to the broker with the correct config', () => {
    initialiseConsumer();

    expect(ConnectFailover).toHaveBeenCalledWith([
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
    ]);
  });

  it('should throw if the queue urls are not configured correctly', () => {
    config.queueUrl1 = 'some-url-without-protocol:some-port';

    expect(() => initialiseConsumer()).toThrow(
      new Error('Queue url should have the format protocol://host:port')
    );
  });

  it('should throw when there is an error connecting to the broker', () => {
    const error = new Error('some-error-happened');
    connect.mockImplementation(callback => callback(error));

    return expect(() => initialiseConsumer()).toThrow(error);
  });

  it('should subscribe to the queue with the correct config', () => {
    initialiseConsumer();
    expect(subscribe).toHaveBeenCalledWith({ destination: config.queueName }, expect.anything());
  });

  it('should throw when there is an error subscribing to the queue', () => {
    const error = new Error('some-error-happened');
    subscribe.mockImplementation((config, callback) => callback(error));

    expect(() => initialiseConsumer()).toThrow(error);
  });

  it('should read the message from the queue with the correct encoding', () => {
    initialiseConsumer();
    expect(readString).toHaveBeenCalledWith('UTF-8', expect.anything());
  });

  it('should throw when there is an error reading the message', () => {
    const error = new Error('some-error-happened');
    readString.mockImplementation((encoding, callback) => callback(error));

    expect(() => initialiseConsumer()).toThrow(error);
  });

  it('should pass the message to the handler', () => {
    initialiseConsumer();
    expect(handleMessage).toHaveBeenCalledWith('some-message-body');
  });
});
