import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { sendToQueue } from '../publisher/send-to-queue';

class DefaultMessage {
  constructor() {
    this.name = 'Unhandled Message';
  }

  handleMessage(message) {
    updateLogEvent({ status: 'Redirecting Message to unhandled message queue' });
    return sendToQueue(message, { destination: config.unhandledMessagesQueueName });
  }
}

export { DefaultMessage };
