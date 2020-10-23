import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError
} from '../../../middleware/logging';
import { handleMessage } from './';

export const subscriberOnMessageCallback = (channel, message) => async (err, body) => {
  updateLogEvent({ status: 'Handling Message', queue: { messageId: message.id } });
  eventFinished();
  if (err) {
    updateLogEventWithError(err);
    eventFinished();
    return;
  }

  try {
    await handleMessage(body);
  } catch (err) {
    updateLogEvent({ status: 'Handling of message failed - no ACK sent' });
    updateLogEventWithError(err);
    eventFinished();
  } finally {
    updateLogEvent({ status: 'Handling of message succeeded - ACK will be sent' });
    eventFinished();
  }
};
