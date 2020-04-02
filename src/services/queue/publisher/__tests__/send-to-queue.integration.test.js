import { v4 as uuid } from 'uuid';
import { consumeOneMessage } from '../../';
import { sendToQueue } from '../send-to-queue';

jest.unmock('stompit');
jest.unmock('uuid');
jest.mock('../../../../middleware/logging');

const firstMockMessage = 'message';
const secondMockMessage = 'another-message';

describe('sendToQueue', () => {
  it('should put a message on the queue that can then be consumed', async done => {
    const mockQueueName = uuid();
    await sendToQueue(firstMockMessage, { destination: mockQueueName });
    const message = await consumeOneMessage({ destination: mockQueueName });
    expect(message).toEqual(firstMockMessage);
    done();
  });

  describe('having two queues up', () => {
    it('should send messages to correct destination', async done => {
      const mockQueueName = uuid();
      const mockSecondQueueName = uuid();

      await sendToQueue(firstMockMessage, { destination: mockQueueName });
      await sendToQueue(secondMockMessage, { destination: mockSecondQueueName });

      const messageOnDefaultQueue = await consumeOneMessage({ destination: mockQueueName });
      const uhandledMessage = await consumeOneMessage({
        destination: mockSecondQueueName
      });

      expect(messageOnDefaultQueue).toBe(firstMockMessage);
      expect(uhandledMessage).toBe(secondMockMessage);
      done();
    });
  });
});
