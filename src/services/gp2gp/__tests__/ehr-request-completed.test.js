import { parseMultipartBody } from '../../parser/multipart-parser';
import { soapEnvelopeHandler } from '../../soap/soap-envelope-handler';
import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from '../ehr-request-completed';
import { storeMessageInEhrRepo } from '../store-message-in-ehr-repo';

jest.mock('../../parser/multipart-parser', () => ({
  parseMultipartBody: jest.fn().mockResolvedValue([{ body: 'some-message' }])
}));

jest.mock('../../soap/soap-envelope-handler', () => ({
  soapEnvelopeHandler: jest.fn().mockResolvedValue({ info: 'soap-information' })
}));

jest.mock('../store-message-in-ehr-repo', () => ({
  storeMessageInEhrRepo: jest.fn()
}));

describe('EHRRequestCompleted', () => {
  it('should return "EHR Request Completed" when calling name', () => {
    expect(new EHRRequestCompleted().name).toBe('EHR Request Completed');
  });

  it('should return EHR_REQUEST_COMPLETED when calling interactionId', () => {
    expect(new EHRRequestCompleted().interactionId).toBe(EHR_REQUEST_COMPLETED);
  });

  describe('handleMessage', () => {
    it('should call parseMultipartBody', async done => {
      const message = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';
      await new EHRRequestCompleted().handleMessage(message);
      expect(parseMultipartBody).toHaveBeenCalledTimes(1);
      expect(parseMultipartBody).toHaveBeenCalledWith(message);
      done();
    });

    it('should call soapEnvelopeHandler', async done => {
      const message = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';
      await new EHRRequestCompleted().handleMessage(message);
      expect(soapEnvelopeHandler).toHaveBeenCalledTimes(1);
      expect(soapEnvelopeHandler).toHaveBeenCalledWith('some-message');
      done();
    });

    it('should call storeMessageInEhrRepo', async done => {
      const message = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';
      await new EHRRequestCompleted().handleMessage(message);
      expect(storeMessageInEhrRepo).toHaveBeenCalledTimes(1);
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(message, { info: 'soap-information' });
      done();
    });
  });
});
