import config from '../../../config';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { channelPool } from '../helper';
import { subscriberReadMessageCallback } from './subscriber-read-message-callback';

const initialiseSubscriber = (options = {}) =>
  new Promise((resolve, reject) => {
    channelPool.channel((err, channel) => {
      if (err) {
        updateLogEventWithError(err);
        reject(err);
      }

      updateLogEvent({
        status: 'Initialising Subscriber',
        queue: { name: config.queueName, ...options, ackType: options.ack || 'client-individual' }
      });

      channel.subscribe(
        { destination: config.queueName, ack: 'client-individual', ...options },
        subscriberReadMessageCallback(channel)
      );

      resolve(channel);
    });
  });

export { initialiseSubscriber };
