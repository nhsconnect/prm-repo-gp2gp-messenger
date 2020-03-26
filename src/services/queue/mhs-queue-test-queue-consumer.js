import config from '../../config';
import { connectToQueue } from '../../config/queue';

// Consumes one message off the queue then disconnects from queue
export const consumeOneMessage = () =>
  new Promise((resolve, reject) => {
    const subscribeCallback = client => (err, message) => {
      message.readString('utf-8', (error, body) => {
        if (error) {
          reject(error);
        }
        client.ack(message);
        client.disconnect();
        resolve(body);
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
        { destination: config.queueName, ack: 'client-individual' },
        subscribeCallback(client)
      );
    });
  });
