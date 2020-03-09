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
        reject(err); // not tested
      }
      putMessageOnQueue(client, message);
      client.disconnect();
      resolve();
    });
  });

const clearQueue = async () => {
  await sendToQueue('EOF');
  return new Promise((resolve, reject) =>
    connectToQueue((err, client) => {
      if (err) {
        reject(err); // not tested
      }

      client.on('error', error => {
        client.disconnect();
        reject(error);
      });

      client.subscribe({ destination: config.queueName, ack: 'client' }, (error, message) => {
        if (error) {
          reject(error); // not tested
        }
        message.readString('utf-8', (error, body) => {
          if (error) {
            reject(error); // not tested
          }

          client.ack(message);
          if (body === 'EOF') client.destroy('Queue quit');
        });
      });

      resolve(client);
    })
  );
};

export { sendToQueue, clearQueue };
