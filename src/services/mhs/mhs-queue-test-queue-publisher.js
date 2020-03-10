import { connectToQueue } from '../../config/queue';
import config from '../../config';
import uuid from 'uuid/v4';

const putMessageOnQueue = (client, message) => {
  const transaction = client.begin();
  const frame = transaction.send({ destination: config.queueName });
  frame.write(message);
  frame.end();
  transaction.commit();
};

const sendToQueue = message =>
  new Promise((resolve, reject) => {
    connectToQueue((err, client) => {
      if (err) {
        reject(err);
      }
      putMessageOnQueue(client, message);
      client.disconnect();
      resolve();
    });
  });

const clearQueue = async () => {
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

export { sendToQueue, clearQueue };
