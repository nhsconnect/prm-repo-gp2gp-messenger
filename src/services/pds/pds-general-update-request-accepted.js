import { logEvent } from '../../middleware/logging';
import { parseMultipartBody } from '../parser/';
import { soapEnvelopeHandler } from '../soap';
import { sendPdsUpdate } from '../gp-to-repo/';

const PDS_GENERAL_UPDATE_REQUEST_ACCEPTED = 'PRPA_IN000202UK01';

class PDSGeneralUpdateRequestAccepted {
  constructor() {
    this.name = 'PDS General Update Request Accepted';
    this.interactionId = PDS_GENERAL_UPDATE_REQUEST_ACCEPTED;
  }

  async handleMessage(message) {
    logEvent('Parsing PRPA_IN000202UK01 Message', {
      parser: { name: this.name, interactionId: this.interactionId }
    });
    const multipartMessage = await parseMultipartBody(message);
    const soapInformation = await soapEnvelopeHandler(multipartMessage[0].body);
    const conversationId = soapInformation.conversationId;
    await sendPdsUpdate(conversationId);
    logEvent('SOAP Information Extracted', {
      messageDetails: soapInformation,
      conversationId
    });
  }
}

export { PDSGeneralUpdateRequestAccepted, PDS_GENERAL_UPDATE_REQUEST_ACCEPTED };
