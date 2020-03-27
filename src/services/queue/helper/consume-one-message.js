import { connectToQueue } from '../';
import config from '../../../config';

// Consumes one message off the queue then disconnects from queue
export const consumeOneMessage = (options = {}) =>
  new Promise((resolve, reject) => {
    const subscribeCallback = client => (err, stream) => {
      stream.readString('utf-8', (error, message) => {
        if (error) {
          reject(error);
        }
        client.ack(stream);
        client.disconnect();
        resolve(message);
      });
    };

    connectToQueue((error, client) => {
      if (error) {
        reject(error);
      }

      // Timeout required for when message queue is empty
      // it will unsubscribe and disconnect after 0.5s if no messages have been detected
      setTimeout(() => {
        resolve({});
        client.disconnect();
      }, 500);

      client.subscribe(
        { destination: config.queueName, ack: 'client-individual', ...options },
        subscribeCallback(client)
      );
    });
  });
