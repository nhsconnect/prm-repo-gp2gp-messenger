import { extractNhsNumber } from '../parser/message/extract-nhs-number';
const EHR_REQUEST_COMPLETED = 'RCMR_IN030000UK08';

class EHRRequestCompleted {
  constructor() {
    this.name = 'EHR Request Completed';
    this.interactionId = EHR_REQUEST_COMPLETED;
  }

  handleMessage(message) {
    return extractNhsNumber(message);
  }
}

export { EHRRequestCompleted, EHR_REQUEST_COMPLETED };
