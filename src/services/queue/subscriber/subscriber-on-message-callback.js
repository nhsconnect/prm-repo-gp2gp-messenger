import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError
} from '../../../middleware/logging';
import { handleMessage } from './';

export const subscriberOnMessageCallback = (client, message) => async (err, body) => {
  if (err) {
    updateLogEventWithError(err);
    eventFinished();
    return;
  }

  try {
    await handleMessage(body);
    updateLogEvent({ status: 'Acknowledging Message', queue: { mqMessageId: message.id } });
    client.ack(message);
    updateLogEvent({ status: 'Message Handled Successfully' });
  } catch (err) {
    updateLogEventWithError(err);
    client.ack(message);
  } finally {
    eventFinished();
  }
};
