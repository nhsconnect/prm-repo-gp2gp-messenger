import { v4 as uuid } from 'uuid';
import { sendToQueue } from '../';
import config from '../../../config';
import { connectToQueue } from '../../../config/queue';

export const clearQueue = async () => {
  const endOfQueueMessage = `EOQ-${uuid()}`;

  await sendToQueue(endOfQueueMessage);

  return new Promise((resolve, reject) =>
    connectToQueue((err, client) => {
      if (err) {
        reject(err);
      }

      client.on('error', error => {
        client.disconnect();
        reject(error);
      });

      client.subscribe(
        { destination: config.queueName, ack: 'client-individual' },
        (error, message) => {
          if (error) {
            reject(error);
          }

          message.readString('utf-8', async (error, body) => {
            if (error) {
              reject(error);
            }

            await client.ack(message);
            if (body === endOfQueueMessage) client.disconnect();
          });
        }
      );

      resolve(client);
    })
  );
};
