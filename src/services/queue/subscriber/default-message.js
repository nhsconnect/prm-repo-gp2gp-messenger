import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { sendToQueueOld } from '../publisher/send-to-queue-old';

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
    return sendToQueueOld(message, { destination: config.unhandledMessagesQueueName });
  }
}

export { DefaultMessage };
