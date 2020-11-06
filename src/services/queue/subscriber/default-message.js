import { initialiseConfig } from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { sendToQueue } from '../publisher/send-to-queue';

class DefaultMessage {
  constructor() {
    this.name = 'Unhandled Message';
    this.interactionId = 'Undefined';
    this.config = initialiseConfig();
  }

  handleMessage(message) {
    updateLogEvent({
      status: `Redirecting ${this.interactionId} Message to ${this.config.unhandledMessagesQueueName}`,
      parser: { name: this.name, interactionId: this.interactionId }
    });
    return sendToQueue(message, { destination: this.config.unhandledMessagesQueueName });
  }
}

export { DefaultMessage };
