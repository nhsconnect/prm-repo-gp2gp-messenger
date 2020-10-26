import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError
} from '../../../middleware/logging';
import { handleMessage } from './';

export const subscriberOnMessageCallback = (channel, message) => async (err, body) => {
  updateLogEvent({ status: 'Handling Message', queue: { messageId: message.id } });

  if (err) {
    updateLogEventWithError(err);
    eventFinished();
    return;
  }

  try {
    await handleMessage(body);
  } catch (err) {
    updateLogEventWithError(err);
  } finally {
    channel.ack(message);
    eventFinished();
  }
};
