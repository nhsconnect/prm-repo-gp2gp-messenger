import { logEvent } from '../../../middleware/logging';
import {
  PDSGeneralUpdateRequestAccepted,
  PDS_GENERAL_UPDATE_REQUEST_ACCEPTED
} from '../pds-general-update-request-accepted';
import {
  conversationId,
  pdsGenerateUpdateRequest
} from './data/pds-generate-update-request-accepted';
import { sendPdsUpdate } from '../../gp-to-repo';

jest.mock('../../../middleware/logging');

jest.mock('../../gp-to-repo/send-pds-update', () => ({
  sendPdsUpdate: jest.fn()
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
    it('should call logEvent to update status to "Parsing PRPA_IN000202UK01 Message', async done => {
      const pdsRequestAccepted = new PDSGeneralUpdateRequestAccepted();
      await pdsRequestAccepted.handleMessage(pdsGenerateUpdateRequest);
      expect(logEvent).toHaveBeenCalledWith('Parsing PRPA_IN000202UK01 Message', expect.anything());
      expect(logEvent).toHaveBeenCalledWith('SOAP Information Extracted', expect.anything());
      done();
    });

    it('should call logEvent to update parser information', async done => {
      const pdsRequestAccepted = new PDSGeneralUpdateRequestAccepted();
      await pdsRequestAccepted.handleMessage(pdsGenerateUpdateRequest);
      expect(logEvent).toHaveBeenCalledWith(
        'Parsing PRPA_IN000202UK01 Message',
        expect.objectContaining({
          parser: expect.objectContaining({
            name: pdsRequestAccepted.name,
            interactionId: pdsRequestAccepted.interactionId
          })
        })
      );
      expect(logEvent).toHaveBeenCalledWith('SOAP Information Extracted', expect.anything());
      done();
    });

    it('should call logEvent to update messageDetails with soap information and conversation ID', async done => {
      await new PDSGeneralUpdateRequestAccepted().handleMessage(pdsGenerateUpdateRequest);
      expect(logEvent).toHaveBeenCalledWith(
        'SOAP Information Extracted',
        expect.objectContaining({
          messageDetails: expect.any(Object),
          conversationId: conversationId
        })
      );
      done();
    });

    it('should call logEvent to update messageDetails with soap information and conversation ID', async done => {
      await new PDSGeneralUpdateRequestAccepted().handleMessage(pdsGenerateUpdateRequest);
      expect(sendPdsUpdate).toHaveBeenCalledWith(conversationId);
      done();
    });
  });
});
