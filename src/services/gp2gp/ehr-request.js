import { logError, logEvent } from '../../middleware/logging';
import { parseMultipartBody } from '../parser';
import { extractNhsNumber } from '../parser/message';
import { sendEhrRequest } from '../repo-to-gp/send-ehr-request';
import { extractOdsCode } from '../parser/message/extract-ods-code';
import { extractConversationId } from '../parser/soap';

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
      const nhsNumber = await extractNhsNumber(multipartMessage[1].body);
      const odsCode = await extractOdsCode(multipartMessage[1].body);
      const conversationId = await extractConversationId(multipartMessage[0].body);

      logEvent(
        `Parsed EHR Request message: nhsNumber: ${nhsNumber}, conversationId: ${conversationId}, odsCode: ${odsCode}`
      );

      await sendEhrRequest(nhsNumber, conversationId, odsCode);
    } catch (err) {
      logError('handleMessage failed', err);
    }
  }
}
