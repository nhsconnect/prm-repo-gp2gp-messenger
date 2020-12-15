import { logError, logEvent } from '../../middleware/logging';
import { parseMultipartBody } from '../parser';
import { extractNhsNumber } from '../parser/message';
import { sendEhrRequest } from '../repo-to-gp/send-ehr-request';
import { extractOdsCode } from '../parser/message/extract-ods-code';
import { extractConversationId } from '../parser/soap';
import { extractEhrRequestId } from '../parser/message/extract-ehr-request-id';

export const EHR_REQUEST = 'RCMR_IN010000UK05';

export class EhrRequest {
  constructor() {
    this.name = 'Received EHR Request';
    this.interactionId = EHR_REQUEST;
  }

  async handleMessage(message) {
    try {
      logEvent(`Parsing ${this.interactionId} Message`, {
        parser: {
          name: this.name,
          interactionId: this.interactionId
        }
      });
      const multipartMessage = await parseMultipartBody(message);
      const [envelope, content] = multipartMessage;
      const nhsNumber = await extractNhsNumber(content.body);
      const odsCode = await extractOdsCode(content.body);
      const ehrRequestId = await extractEhrRequestId(content.body);
      const conversationId = await extractConversationId(envelope.body);

      logEvent(`Parsed EHR Request message`);

      await sendEhrRequest(nhsNumber, conversationId, odsCode, ehrRequestId);
    } catch (err) {
      logError('handleMessage failed', err);
    }
  }
}
