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
    it('should call updateLogEvent to update status to "Parsing PRPA_IN000202UK01 Message', async done => {
      const pdsRequestAccepted = new PDSGeneralUpdateRequestAccepted();
      await pdsRequestAccepted.handleMessage(pdsGenerateUpdateRequest);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Parsing PRPA_IN000202UK01 Message'
        })
      );
      done();
    });

    it('should call updateLogEvent to update parser information', async done => {
      const pdsRequestAccepted = new PDSGeneralUpdateRequestAccepted();
      await pdsRequestAccepted.handleMessage(pdsGenerateUpdateRequest);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          parser: expect.objectContaining({
            name: pdsRequestAccepted.name,
            interactionId: pdsRequestAccepted.interactionId
          })
        })
      );
      done();
    });

    it('should call updateLogEvent to update status to "SOAP Information Extracted"', async done => {
      await new PDSGeneralUpdateRequestAccepted().handleMessage(pdsGenerateUpdateRequest);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'SOAP Information Extracted'
        })
      );
      done();
    });

    it('should call updateLogEvent to update messageDetails with soap information', async done => {
      await new PDSGeneralUpdateRequestAccepted().handleMessage(pdsGenerateUpdateRequest);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          messageDetails: expect.any(Object)
        })
      );
      done();
    });
  });
});
