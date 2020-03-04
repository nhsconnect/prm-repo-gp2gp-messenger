import { connectToQueue } from '../../../src/config/queue';
import config from '../../config';

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

export { sendToQueue };
