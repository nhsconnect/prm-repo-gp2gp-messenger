import { updateLogEvent } from '../../middleware/logging';
import { parseMultipartBody } from '../parser/multipart-parser';
import { soapEnvelopeHandler } from '../soap';
const PDS_GENERAL_UPDATE_REQUEST_ACCEPTED = 'PRPA_IN000202UK01';
class PDSGeneralUpdateRequestAccepted {
  constructor() {
    this.name = 'PDS General Update Request Accepted';
    this.interactionId = PDS_GENERAL_UPDATE_REQUEST_ACCEPTED;
  }

  async handleMessage(message) {
    updateLogEvent({
      status: 'Parsing PRPA_IN000202UK01 Message',
      parser: { name: this.name, interactionId: this.interactionId }
    });
    const multipartMessage = await parseMultipartBody(message);
    const soapInformation = await soapEnvelopeHandler(multipartMessage[0].body);
    updateLogEvent({
      status: 'SOAP Information Extracted',
      messageDetails: soapInformation
    });
  }
}

export { PDSGeneralUpdateRequestAccepted, PDS_GENERAL_UPDATE_REQUEST_ACCEPTED };
