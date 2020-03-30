import { subscriberOnMessageCallback } from './subscriber-on-message-callback';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError,
  withContext
} from '../../../middleware/logging';

export const subscriberReadMessageCallback = client => (err, message) => {
  withContext(() => {
    updateLogEvent({ status: 'Consuming received message' });

    if (err) {
      updateLogEventWithError(err);
      eventFinished();
      return;
    }
    message.readString('UTF-8', subscriberOnMessageCallback(client, message));
  });
};
