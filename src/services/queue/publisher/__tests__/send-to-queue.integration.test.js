import { clearQueue, consumeOneMessage, sendToQueue } from '../../';
import config from '../../../../config';

jest.unmock('stompit');

const firstMockMessage = 'message';
const secondMockMessage = 'another-message';

describe('sendToQueue', () => {
  afterEach(async () => {
    await clearQueue();
    await clearQueue(config.unhandledMessagesQueueName);
  });

  it('should put a message on the queue that can then be consumed', async done => {
    await sendToQueue(firstMockMessage);
    const message = await consumeOneMessage();
    expect(message).toEqual(firstMockMessage);
    done();
  });

  describe('having two queues up', () => {
    it('should send messages to correct destination', async done => {
      await sendToQueue(firstMockMessage);
      await sendToQueue(secondMockMessage, { destination: config.unhandledMessagesQueueName });

      const messageOnDefaultQueue = await consumeOneMessage();
      const uhandledMessage = await consumeOneMessage({
        destination: config.unhandledMessagesQueueName
      });

      expect(messageOnDefaultQueue).toBe(firstMockMessage);
      expect(uhandledMessage).toBe(secondMockMessage);
      done();
    });
  });
});
