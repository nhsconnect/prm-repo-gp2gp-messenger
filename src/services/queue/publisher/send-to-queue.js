import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { channelPool } from '../helper';
import config from '../../../config';

export const sendToQueue = (message, options = {}) =>
  new Promise((resolve, reject) => {
    updateLogEvent({ status: 'Sending Message to Queue' });

    channelPool.channel((error, channel) => {
      if (error) {
        updateLogEventWithError(error);
        reject(error);
      }

      channel.send(
        {
          destination: config.queueName,
          ...options
        },
        message,
        err => {
          if (err) {
            updateLogEventWithError(err);
            reject(err);
          }

          updateLogEvent({ status: 'Sent Message Successfully' });
          channel.close();
          resolve();
        }
      );
    });
  });
