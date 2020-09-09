import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { channelPool } from '../helper';
import config from '../../../config';

export const sendToQueue = (message, options = {}) => {
  return new Promise((resolve, reject) => {
    updateLogEvent({ status: 'Sending Message to Queue' });

    channelPool.channel((error, channel) => {
      if (error) {
        updateLogEventWithError(error);
        reject(error);
      }

      const transaction = channel.begin({
        destination: config.queueName,
        ...options
      });

      transaction.send(
        {
          destination: config.queueName,
          ...options
        },
        message
      );

      transaction.commit(err => {
        if (err) {
          updateLogEventWithError(err);
          transaction.abort();
          reject(err);
        }

        updateLogEvent({ status: 'Sent Message Successfully' });
        channel.close();
        resolve();
      });
    });
  });
};
