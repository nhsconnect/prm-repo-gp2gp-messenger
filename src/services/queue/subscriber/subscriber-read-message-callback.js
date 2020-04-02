import { subscriberOnMessageCallback } from './subscriber-on-message-callback';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError,
  withContext
} from '../../../middleware/logging';

export const subscriberReadMessageCallback = channel => (err, messageStream) => {
  withContext(() => {
    updateLogEvent({ status: 'Subscriber has Received Message' });

    if (err) {
      updateLogEventWithError(err);
      eventFinished();
      return;
    }

    messageStream.readString('UTF-8', subscriberOnMessageCallback(channel, messageStream));
  });
};
