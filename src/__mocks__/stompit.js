export const mockStream = {
  write: jest.fn(),
  end: jest.fn()
};

export const mockTransaction = {
  send: jest.fn().mockImplementation(() => mockStream),
  commit: jest.fn()
};

export const mockedMessageOnQueue = 'mock-message';
export const mockMessageStream = {
  readString: jest.fn().mockImplementation((_, callback) => {
    callback(false, mockedMessageOnQueue);
  })
};

export const mockClient = {
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
  subscribe: jest.fn().mockImplementation((_, callback) => callback(false, mockMessageStream)),
  begin: jest.fn().mockImplementation(() => mockTransaction),
  on: jest.fn(),
  ack: jest.fn().mockResolvedValue(),
  nack: jest.fn().mockResolvedValue(),
  disconnect: jest.fn()
};

export const connect = jest.fn().mockImplementation(callback => callback(false, mockClient));

export const ConnectFailover = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  connect: connect
}));
