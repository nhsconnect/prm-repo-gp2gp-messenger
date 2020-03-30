import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { sendToQueue } from '../publisher/send-to-queue';

class DefaultMessage {
  constructor() {
    this.name = 'Unhandled Message';
    this.interactionId = 'Undefined';
  }

  handleMessage(message) {
    updateLogEvent({
      status: `Redirecting ${this.interactionId} Message to ${config.unhandledMessagesQueueName}`,
      parser: { name: this.name, interactionId: this.interactionId }
    });
    return sendToQueue(message, { destination: config.unhandledMessagesQueueName });
  }
}

export { DefaultMessage };
