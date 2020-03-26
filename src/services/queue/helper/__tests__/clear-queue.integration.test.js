import { sendToQueue } from '../../publisher/send-to-queue';
import { clearQueue } from '../clear-queue';
import { consumeOneMessage } from '../consume-one-message';

jest.unmock('stompit');

describe('clearQueue', () => {
  afterEach(async () => {
    await clearQueue();
  });

  it('should clear the queue when multiple messages have been added', async done => {
    await sendToQueue('message 1');
    await sendToQueue('message 2');
    await sendToQueue('message 3');
    await sendToQueue('message 4');
    await clearQueue();
    const message = await consumeOneMessage();
    expect(message).toEqual({});
    done();
  });

  it('should not fail if queue is empty when clearing queue', async done => {
    await clearQueue();
    const message = await consumeOneMessage();
    expect(message).toEqual({});
    done();
  });
});
