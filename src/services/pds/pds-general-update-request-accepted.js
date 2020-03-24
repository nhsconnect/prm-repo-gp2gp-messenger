import { updateLogEvent } from '../../middleware/logging';
const PDS_GENERAL_UPDATE_REQUEST_ACCEPTED = 'PRPA_IN000202UK01';

class PDSGeneralUpdateRequestAccepted {
  constructor() {
    this.name = 'PDS General Update Request Accepted';
    this.interactionId = PDS_GENERAL_UPDATE_REQUEST_ACCEPTED;
  }

  handleMessage() {
    updateLogEvent({
      status: 'Handling PDS General Update Request Accepted (PRPA_IN000202UK01) Message'
    });
    return;
  }
}

export { PDSGeneralUpdateRequestAccepted, PDS_GENERAL_UPDATE_REQUEST_ACCEPTED };
