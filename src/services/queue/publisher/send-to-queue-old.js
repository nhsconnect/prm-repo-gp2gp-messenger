import { connectToQueue } from '../';
import config from '../../../config';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { putMessageOnQueueOld } from './put-message-on-queue-old';

const sendToQueueOld = (message, options = {}) =>
  new Promise((resolve, reject) => {
    connectToQueue((err, client) => {
      if (err) {
        updateLogEventWithError(err);
        reject(err);
      }

      const allOptions = { destination: config.queueName, ...options };
      updateLogEvent({ status: 'Connected to the queue', queue: { options: allOptions } });
      putMessageOnQueueOld(client, message, allOptions);

      updateLogEvent({ status: 'Disconnecting from message client' });
      client.disconnect();
      resolve(client);
    });
  });

export { sendToQueueOld };
