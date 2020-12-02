import { storeMessageInEhrRepo } from '../ehr';
import { extractNhsNumber } from '../parser/message';
import { parseMultipartBody } from '../parser/multipart-parser';
import { soapEnvelopeHandler } from '../soap';
import { logEvent, logError } from '../../middleware/logging';
import { sendEhrMessageReceived } from '../gp-to-repo/send-ehr-message-received';

const EHR_REQUEST_COMPLETED = 'RCMR_IN030000UK06';

class EHRRequestCompleted {
  constructor() {
    this.name = 'Electronic Healthcare Record Request Completed (GP2GP v1.1)';
    this.interactionId = EHR_REQUEST_COMPLETED;
  }

  async handleMessage(message) {
    logEvent(`Parsing ${this.interactionId} Message`, {
      parser: {
        name: this.name,
        interactionId: this.interactionId
      }
    });

    const multipartMessage = await parseMultipartBody(message);
    const soapInformation = await soapEnvelopeHandler(multipartMessage[0].body);
    const nhsNumber = await extractNhsNumber(multipartMessage[1].body).catch(() => {});
    const messageDetails = nhsNumber ? { ...soapInformation, nhsNumber } : soapInformation;

    logEvent('SOAP Information Extracted', {
      messageDetails
    });

    try {
      await storeMessageInEhrRepo(message, messageDetails);
      await sendEhrMessageReceived(soapInformation.conversationId, soapInformation.messageId);

      logEvent('EHR Message Received Notification sent');
    } catch (err) {
      logError(err);
    }
  }
}

export { EHRRequestCompleted, EHR_REQUEST_COMPLETED };
