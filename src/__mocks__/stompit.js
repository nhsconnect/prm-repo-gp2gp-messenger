export const mockStream = {
  write: jest.fn(),
  end: jest.fn()
};

export const mockTransaction = {
  send: jest.fn().mockImplementation(() => mockStream),
  commit: jest.fn().mockImplementation(callback => callback(null)),
  abort: jest.fn(),
  id: '1'
};

export const mockedMessageOnQueue = 'mock-message';
export const mockMessageStream = {
  readString: jest.fn().mockImplementation((_, callback) => {
    callback(false, mockedMessageOnQueue);
  })
};

export const connect = jest.fn().mockImplementation(callback => callback(false, mockChannel));

export const mockOn = jest.fn();

export const mockChannel = {
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
  subscribe: jest.fn().mockImplementation((_, callback) =>
    callback(false, mockMessageStream, {
      unsubscribe: jest.fn()
    })
  ),
  begin: jest.fn().mockImplementation(() => mockTransaction),
  on: jest.fn(),
  ack: jest.fn().mockResolvedValue(),
  nack: jest.fn().mockResolvedValue(),
  send: jest.fn().mockImplementation((options, message, callback) => callback(null)),
  close: jest.fn()
};

export const channel = jest.fn().mockImplementation(callback => callback(false, mockChannel));

export const ConnectFailover = jest.fn().mockImplementation(() => ({
  on: mockOn,
  connect
}));

export const ChannelPool = jest.fn().mockImplementation(() => ({
  channel
}));
