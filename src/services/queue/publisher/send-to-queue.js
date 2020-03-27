import { connectToQueue } from '../';
import { putMessageOnQueue } from './put-message-on-queue';

const sendToQueue = message =>
  new Promise((resolve, reject) => {
    connectToQueue((err, client) => {
      if (err) {
        reject(err);
      }
      putMessageOnQueue(client, message);
      client.disconnect();
      resolve(client);
    });
  });

export { sendToQueue };
