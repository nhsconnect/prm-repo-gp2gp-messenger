import amqp, { mockClient } from 'amqplib';
import config from '../../../config';
import { generateQueueConfig } from '../../../config/utils/generate-queue-config';
import { TestQueuePublisher } from '../mhs-queue-test-queue-publisher';

describe('mhs-queue-test-helper', () => {
  let queuePublisher;

  const originalQueueUrl = config.testQueueUrl;
  const mockQueueUrl = 'tcp://localhost:61622';

  beforeEach(async () => {
    jest.mock('amqplib');
    config.testQueueUrl = mockQueueUrl;
    queuePublisher = await new TestQueuePublisher();
  });

  afterEach(() => {
    config.testQueueUrl = originalQueueUrl;
  });

  it('should connect with queue using formated queue config', async done => {
    const queueConfig = { protocol: 'amqp', ...generateQueueConfig(mockQueueUrl) };
    expect(amqp.connect).toHaveBeenCalledTimes(1);
    expect(amqp.connect).toHaveBeenCalledWith(queueConfig);
    done();
  });

  describe('TestQueuePublisher.isConnected', () => {
    it('should return false when client is undefined', async done => {
      queuePublisher.client = undefined;
      expect(await queuePublisher.isConnected()).toBe(false);
      done();
    });

    it('should return false when connect.connection.stream.readable is false', async done => {
      const connection = getConnectionTemplate(false, true);
      mockClient.createConfirmChannel.mockResolvedValue(connection);

      queuePublisher = await new TestQueuePublisher();
      expect(await queuePublisher.isConnected()).toBe(false);
      done();
    });

    it('should return false when connect.connection.stream.writable is false', async done => {
      const connection = getConnectionTemplate(true, false);
      mockClient.createConfirmChannel.mockResolvedValue(connection);

      queuePublisher = await new TestQueuePublisher();
      expect(await queuePublisher.isConnected()).toBe(false);
      done();
    });

    it('should return false when connect.connection.stream.writable & connect.connection.stream.readable are false', async done => {
      const connection = getConnectionTemplate(false, false);
      mockClient.createConfirmChannel.mockResolvedValue(connection);

      queuePublisher = await new TestQueuePublisher();
      expect(await queuePublisher.isConnected()).toBe(false);
      done();
    });
  });

  it('should disconnect from the queue using formated queue config', async done => {
    const connection = getConnectionTemplate(true, true);
    mockClient.createConfirmChannel.mockResolvedValue(connection);

    queuePublisher = await new TestQueuePublisher();
    await queuePublisher.disconnect();
    expect(connection.close).toHaveBeenCalledTimes(1);
    done();
  });
});

const getConnectionTemplate = (readable, writable) => {
  return {
    connection: {
      stream: {
        readable: readable,
        writable: writable
      }
    },
    close: jest.fn()
  };
};
