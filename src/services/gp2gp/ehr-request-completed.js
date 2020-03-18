const EHR_REQUEST_COMPLETED = 'RCMR_IN030000UK08';

class EHRRequestCompleted {
  constructor() {
    this.name = 'EHR Request Completed';
    this.interactionId = EHR_REQUEST_COMPLETED;
  }

  handleMessage() {
    return {};
  }
}

export { EHRRequestCompleted, EHR_REQUEST_COMPLETED };
