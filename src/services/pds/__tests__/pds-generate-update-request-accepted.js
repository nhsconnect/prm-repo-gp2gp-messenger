import { updateLogEvent } from '../../../middleware/logging';
import {
  PDSGeneralUpdateRequestAccepted,
  PDS_GENERAL_UPDATE_REQUEST_ACCEPTED
} from '../pds-general-update-request-accepted';

jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn()
}));

describe('PDSGeneralUpdateRequestAccepted', () => {
  it('should return "PDS General Update Request Accepted" when calling name', () => {
    expect(new PDSGeneralUpdateRequestAccepted().name).toBe('PDS General Update Request Accepted');
  });

  it('should return PDS_GENERAL_UPDATE_REQUEST_ACCEPTED when calling interactionId', () => {
    expect(new PDSGeneralUpdateRequestAccepted().interactionId).toBe(
      PDS_GENERAL_UPDATE_REQUEST_ACCEPTED
    );
  });

  describe('handleMessage', () => {
    it('should call updateLogEvent to update status', () => {
      const message = '<PRPA_IN000202UK01></PRPA_IN000202UK01>';
      new PDSGeneralUpdateRequestAccepted().handleMessage(message);
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Handling PDS General Update Request Accepted (PRPA_IN000202UK01) Message'
        })
      );
    });
  });
});
