import { v4 as uuid } from 'uuid';
import { clearQueue, consumeOneMessage } from '../';
import { sendToQueueOld } from '../../';

jest.unmock('stompit');
jest.unmock('uuid');

describe('clearQueue', () => {
  it('should clear the queue when multiple messages have been added', async done => {
    const mockQueueName = uuid();
    await sendToQueueOld('message 1', { destination: mockQueueName });
    await sendToQueueOld('message 2', { destination: mockQueueName });
    await sendToQueueOld('message 3', { destination: mockQueueName });
    await sendToQueueOld('message 4', { destination: mockQueueName });
    await clearQueue({ destination: mockQueueName });
    const message = await consumeOneMessage({ destination: mockQueueName });
    expect(message).toEqual({});
    done();
  });

  it('should not fail if queue is empty when clearing queue', async done => {
    const mockQueueName = uuid();
    await clearQueue({ destination: mockQueueName });
    const message = await consumeOneMessage({ destination: mockQueueName });
    expect(message).toEqual({});
    done();
  });
});
