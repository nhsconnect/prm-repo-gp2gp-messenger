import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';
import { parseMultipartBody } from '../parser';
import { soapEnvelopeHandler } from '../soap';
import { extractNhsNumber } from '../parser/message';
import { sendEhrRequest } from '../repo-to-gp/send-ehr-request';
import { extractOdsCode } from '../parser/message/extract-ods-code';

export const EHR_REQUEST = 'RCMR_IN010000UK05';

export class EhrRequest {
  constructor() {
    this.name = 'Received EHR Request';
    this.interactionId = EHR_REQUEST;
  }

  async handleMessage(message) {
    try {
      updateLogEvent({
        status: `Parsing ${this.interactionId} Message`,
        parser: {
          name: this.name,
          interactionId: this.interactionId
        }
      });

      const multipartMessage = await parseMultipartBody(message);
      const soapInformation = await soapEnvelopeHandler(multipartMessage[0].body);
      const nhsNumber = await extractNhsNumber(multipartMessage[1].body);
      const odsCode = await extractOdsCode(multipartMessage[1].body);
      const conversationId = soapInformation.conversationId;

      updateLogEvent({
        status: `Parsed nhsNumber: ${nhsNumber}, conversationId: ${conversationId}, odsCode: ${odsCode}`
      });

      await sendEhrRequest(nhsNumber, conversationId, odsCode);
    } catch (err) {
      updateLogEventWithError(err);
    }
  }
}
