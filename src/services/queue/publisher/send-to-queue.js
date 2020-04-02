import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { channelPool } from '../helper';
import config from '../../../config';

export const sendToQueue = (message, options = {}) => {
  updateLogEvent({ status: 'Sending Message to Queue' });

  channelPool.channel((error, channel) => {
    if (error) {
      updateLogEventWithError(error);
      return;
    }

    channel.send(
      {
        destination: config.queueName,
        ...options
      },
      message,
      err => {
        if (err) updateLogEventWithError(err);
        channel.close();
      }
    );
  });
};
