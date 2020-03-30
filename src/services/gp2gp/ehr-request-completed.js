import { storeMessageInEhrRepo } from '../ehr';
import { extractNhsNumber } from '../parser/message';
import { parseMultipartBody } from '../parser/multipart-parser';
import { soapEnvelopeHandler } from '../soap';
import { updateLogEvent } from '../../middleware/logging';

const EHR_REQUEST_COMPLETED = 'RCMR_IN030000UK06';

class EHRRequestCompleted {
  constructor() {
    this.name = 'Electronic Healthcare Record Request Completed (GP2GP v1.1)';
    this.interactionId = EHR_REQUEST_COMPLETED;
  }

  async handleMessage(message) {
    updateLogEvent({
      status: `Parsing ${this.interactionId} Message`,
      parser: {
        name: this.name,
        interactionId: this.interactionId
      }
    });

    const multipartMessage = await parseMultipartBody(message);
    const soapInformation = await soapEnvelopeHandler(multipartMessage[0].body);
    const nhsNumber = await extractNhsNumber(multipartMessage[1].body).catch(() => {});
    const messageDetails = nhsNumber ? { ...soapInformation, nhsNumber } : soapInformation;

    updateLogEvent({
      status: 'SOAP Information Extracted',
      messageDetails
    });
    return await storeMessageInEhrRepo(message, messageDetails);
  }
}

export { EHRRequestCompleted, EHR_REQUEST_COMPLETED };
