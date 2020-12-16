import { channelPool } from '../';
import { initializeConfig } from '../../../config';

// Consumes one message off the queue then disconnects from queue
export const consumeOneMessage = (options = {}) => {
  const config = initializeConfig();
  return new Promise((resolve, reject) => {
    const subscribeCallback = channel => (err, messageStream, subscription) => {
      messageStream.readString('utf-8', async (error, message) => {
        if (error) {
          reject(error);
        }
        await channel.ack(messageStream);
        subscription.unsubscribe();
        channel.close();
        resolve(message);
      });
    };

    channelPool.channel((error, channel) => {
      if (error) {
        reject(error);
      }

      // Timeout required for when message queue is empty
      // it will unsubscribe and disconnect after 0.5s if no messages have been detected
      setTimeout(() => {
        resolve({});
        channel.close();
      }, 500);

      channel.subscribe(
        { destination: config.queueName, ack: 'client-individual', ...options },
        subscribeCallback(channel)
      );
    });
  });
};
