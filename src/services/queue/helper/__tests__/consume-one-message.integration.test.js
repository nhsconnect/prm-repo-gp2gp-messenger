import { clearQueue, consumeOneMessage } from '../';
import config from '../../../../config';
import { sendToQueue } from '../../publisher';

jest.unmock('stompit');

const originalConfig = { ...config };

describe('consumeOneMessage', () => {
  afterEach(async () => {
    await clearQueue();
    config.queueName = originalConfig.queueName;
  });

  beforeEach(() => {
    config.queueName = 'gp2gp-test-queue-two';
  });

  it('should return message from the queue', async done => {
    await sendToQueue('message 1');
    const message = await consumeOneMessage();
    expect(message).toEqual('message 1');
    done();
  });

  it('should return each message from the queue', async done => {
    await sendToQueue('message 1');
    const message = await consumeOneMessage();
    expect(message).toEqual('message 1');
    await sendToQueue('message 2');
    const messageTwo = await consumeOneMessage();
    expect(messageTwo).toEqual('message 2');
    done();
  });

  it('should return empty object if no messages on the queue', async done => {
    const message = await consumeOneMessage();
    expect(message).toEqual({});
    done();
  });
});
