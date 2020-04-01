import { configureChannelPool } from '../configure-channel-pool';
import { v4 as uuid } from 'uuid';
import { consumeOneMessage } from '../consume-one-message';

jest.unmock('stompit');
jest.unmock('uuid');

describe('configureChannelPool', () => {
  let channelPool;

  beforeEach(() => {
    channelPool = configureChannelPool();
  });

  it('should be able to send to queue from the channel pool', async done => {
    const queueName = uuid();
    const sendMessage = 'some-message';

    await channelPool.channel((err, channel) => {
      if (err) throw err;

      channel.send(
        {
          destination: queueName
        },
        sendMessage,
        error => {
          if (error) throw error;
        }
      );
    });

    const message = await consumeOneMessage({ destination: queueName });

    expect(message).toBe(sendMessage);
    done();
  });
});
