import { connectToQueue } from '../';
import config from '../../../config';
import { putMessageOnQueue } from './put-message-on-queue';

const sendToQueue = (message, options = { destination: config.queueName }) =>
  new Promise((resolve, reject) => {
    connectToQueue((err, client) => {
      if (err) {
        reject(err);
      }
      putMessageOnQueue(client, message, options);
      client.disconnect();
      resolve(client);
    });
  });

export { sendToQueue };
