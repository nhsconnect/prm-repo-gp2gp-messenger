import { parseMultipartBody } from '../parser/multipart-parser';
import { soapEnvelopeHandler } from '../soap';
import { storeMessageInEhrRepo } from './store-message-in-ehr-repo';

const EHR_REQUEST_COMPLETED = 'RCMR_IN030000UK08';

class EHRRequestCompleted {
  constructor() {
    this.name = 'EHR Request Completed';
    this.interactionId = EHR_REQUEST_COMPLETED;
  }

  async handleMessage(message) {
    const multipartMessage = await parseMultipartBody(message);
    const soapInformation = await soapEnvelopeHandler(multipartMessage[0].body);
    return await storeMessageInEhrRepo(message, soapInformation);
  }
}

export { EHRRequestCompleted, EHR_REQUEST_COMPLETED };
