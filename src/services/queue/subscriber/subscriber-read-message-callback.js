import { subscriberOnMessageCallback } from './subscriber-on-message-callback';
import { logEvent, logError } from '../../../middleware/logging';

export const subscriberReadMessageCallback = channel => (err, messageStream) => {
  logEvent('Subscriber has Received Message');

  if (err) {
    logError(err);
    return;
  }

  messageStream.readString('UTF-8', subscriberOnMessageCallback(channel, messageStream));
};
