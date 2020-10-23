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

      const subscribeParams = { destination: config.queueName, ack: 'auto', ...options };

      updateLogEvent({
        status: 'Initialising Subscriber',
        queue: subscribeParams
      });

      channel.subscribe(subscribeParams, subscriberReadMessageCallback(channel));

      resolve(channel);
    });
  });

export { initialiseSubscriber };
