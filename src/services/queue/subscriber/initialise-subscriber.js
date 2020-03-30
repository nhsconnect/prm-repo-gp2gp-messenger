import config from '../../../config';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { connectToQueue } from '../helper';
import { subscriberReadMessageCallback } from './subscriber-read-message-callback';

const initialiseSubscriber = (options = {}) =>
  new Promise((resolve, reject) => {
    connectToQueue((err, client) => {
      if (err) {
        updateLogEventWithError(err);
        reject(err);
      }

      updateLogEvent({
        status: 'Initialising Subscriber',
        queue: { name: config.queueName, ackType: 'client-individual' }
      });

      client.subscribe(
        { destination: config.queueName, ack: 'client-individual', ...options },
        subscriberReadMessageCallback(client)
      );

      resolve(client);
    });
  });

export { initialiseSubscriber };
