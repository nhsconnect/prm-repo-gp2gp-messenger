export const mockClient = {
  createConfirmChannel: jest.fn()
};

const amqp = {
  connect: jest.fn().mockResolvedValue(mockClient),
  close: jest.fn()
};

export default amqp;
