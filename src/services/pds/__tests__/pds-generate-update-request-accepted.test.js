import { updateLogEvent } from '../../../middleware/logging';
import {
  PDSGeneralUpdateRequestAccepted,
  PDS_GENERAL_UPDATE_REQUEST_ACCEPTED
} from '../pds-general-update-request-accepted';
import { pdsGenerateUpdateRequest } from './data/pds-generate-update-request-accepted';

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
    it('should call updateLogEvent to update status', async done => {
      await new PDSGeneralUpdateRequestAccepted().handleMessage(pdsGenerateUpdateRequest);
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
