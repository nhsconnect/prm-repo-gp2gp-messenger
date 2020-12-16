import { v4 as uuid } from 'uuid';
import { channelPool, sendToQueue } from '../';
import { initializeConfig } from '../../../config';

export const clearQueue = async (options = {}) => {
  const config = initializeConfig();
  const endOfQueueMessage = `EOQ-${uuid()}`;

  await sendToQueue(endOfQueueMessage, options);
  return new Promise((resolve, reject) => {
    channelPool.channel((err, channel) => {
      if (err) {
        reject(err);
      }

      channel.subscribe(
        { destination: config.queueName, ack: 'client-individual', ...options },
        (error, messageStream, subscription) => {
          if (error) {
            reject(error);
          }

          messageStream.readString('utf-8', async (error, message) => {
            if (error) {
              reject(error);
            }

            await channel.ack(messageStream);

            if (message === endOfQueueMessage) {
              subscription.unsubscribe();
              channel.close();
            }
            resolve();
          });
        }
      );
    });
  });
};
