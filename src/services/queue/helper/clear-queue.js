import { v4 as uuid } from 'uuid';
import { connectToQueue, sendToQueueOld } from '../';
import config from '../../../config';

export const clearQueue = async (options = {}) => {
  const endOfQueueMessage = `EOQ-${uuid()}`;

  await sendToQueueOld(endOfQueueMessage, options);

  return new Promise((resolve, reject) =>
    connectToQueue((err, client) => {
      if (err) {
        reject(err);
      }

      client.subscribe(
        { destination: config.queueName, ack: 'client-individual', ...options },
        (error, stream) => {
          if (error) {
            reject(error);
          }

          stream.readString('utf-8', async (error, message) => {
            if (error) {
              reject(error);
            }

            await client.ack(stream);
            if (message === endOfQueueMessage) client.disconnect();
          });
        }
      );

      resolve(client);
    })
  );
};
