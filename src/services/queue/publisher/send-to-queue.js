import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { initialiseConfig } from '../../../config';
import { channelPool } from '../helper';

export const sendToQueue = (message, options = {}) => {
  const config = initialiseConfig();

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
