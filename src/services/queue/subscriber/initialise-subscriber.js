import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { connectToQueue } from '../helper';
import config from '../../../config';
import { subscriberReadMessageCallback } from './subscriber-read-message-callback';

const initialiseSubscriber = () =>
  new Promise((resolve, reject) => {
    connectToQueue((err, client) => {
      if (err) {
        updateLogEventWithError(err);
        reject(err);
      }

      updateLogEvent({ status: 'Subscribing to MQ', queue: { name: config.queueName } });

      client.subscribe(
        { destination: config.queueName, ack: 'client-individual' },
        subscriberReadMessageCallback(client)
      );

      resolve(client);
    });
  });

export { initialiseSubscriber };
