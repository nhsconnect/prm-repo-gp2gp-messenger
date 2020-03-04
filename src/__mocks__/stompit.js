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
  subscribe: jest.fn(),
  begin: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockImplementation(() => ({
      write: jest.fn(),
      end: jest.fn()
    })),
    commit: jest.fn()
  })),

  ack: jest.fn().mockResolvedValue(),
  nack: jest.fn().mockResolvedValue(),
  disconnect: jest.fn()
};

export const connect = jest.fn().mockImplementation(callback => callback(false, mockClient));

export const ConnectFailover = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  connect: connect
}));
