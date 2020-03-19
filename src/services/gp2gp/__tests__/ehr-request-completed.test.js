import { extractNhsNumber } from '../../parser/message/extract-nhs-number';
import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from '../ehr-request-completed';

jest.mock('../../parser/message/extract-nhs-number', () => ({
  extractNhsNumber: jest.fn().mockResolvedValue('1234567890')
}));

describe('EHRRequestCompleted', () => {
  it('should return "EHR Request Completed" when calling name', () => {
    expect(new EHRRequestCompleted().name).toBe('EHR Request Completed');
  });

  it('should return EHR_REQUEST_COMPLETED when calling interactionId', () => {
    expect(new EHRRequestCompleted().interactionId).toBe(EHR_REQUEST_COMPLETED);
  });

  describe('handleMessage', () => {
    it('should call extractNhsNumber with message', async done => {
      const message = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';
      await new EHRRequestCompleted().handleMessage(message);
      expect(extractNhsNumber).toHaveBeenCalledTimes(1);
      expect(extractNhsNumber).toHaveBeenCalledWith(message);
      done();
    });
  });
});
