import { logEvent, logError } from '../../../middleware/logging';
import { initializeConfig } from '../../../config';
import { channelPool } from '../helper';

export const sendToQueue = (message, options = {}) => {
  const config = initializeConfig();

  return new Promise((resolve, reject) => {
    logEvent('Sending Message to Queue');

    channelPool.channel((error, channel) => {
      if (error) {
        logError('sendToQueue error', error);
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
          logError(err);
          transaction.abort();
          reject(err);
        }

        logEvent('Sent Message Successfully');
        channel.close();
        resolve();
      });
    });
  });
};
