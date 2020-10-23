import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError
} from '../../../middleware/logging';
import { handleMessage } from './';

export const subscriberOnMessageCallback = (channel, message) => async (err, body) => {
  updateLogEvent({
    status: 'Handling Message',
    queue: { messageId: message.id, messageHeaders: message.headers }
  });
  eventFinished();
  if (err) {
    updateLogEventWithError(err);
    eventFinished();
    return;
  }

  try {
    await handleMessage(body);
  } catch (err) {
    updateLogEvent({ status: 'An error has happened' });
    updateLogEventWithError(err);
    eventFinished();
  } finally {
    updateLogEvent({ status: 'Everything is done' });
    eventFinished();
  }
};
