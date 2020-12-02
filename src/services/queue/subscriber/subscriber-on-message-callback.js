import { logError, logEvent } from '../../../middleware/logging';
import { handleMessage } from './';

export const subscriberOnMessageCallback = (channel, message) => async (err, body) => {
  logEvent('Handling Message', { queue: { messageId: message.id } });

  if (err) {
    logError('subscriberOnMessageCallback error', { err });
    return;
  }

  try {
    await handleMessage(body);
  } catch (err) {
    logError('Handling Message error', { err });
  }
};
