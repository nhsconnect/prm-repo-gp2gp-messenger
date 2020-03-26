import { storeMessageInEhrRepo } from '../../ehr';
import { extractNhsNumber } from '../../parser/message/extract-nhs-number';
import { parseMultipartBody } from '../../parser/multipart-parser';
import { soapEnvelopeHandler } from '../../soap/soap-envelope-handler';
import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from '../ehr-request-completed';

jest.mock('../../parser/multipart-parser', () => ({
  parseMultipartBody: jest
    .fn()
    .mockResolvedValue([{ body: 'some-message' }, { body: 'another-message' }])
}));

jest.mock('../../soap/soap-envelope-handler', () => ({
  soapEnvelopeHandler: jest.fn().mockResolvedValue({ info: 'soap-information' })
}));

jest.mock('../../parser/message/extract-nhs-number', () => ({
  extractNhsNumber: jest.fn().mockResolvedValue('1234567890')
}));

jest.mock('../../ehr', () => ({
  storeMessageInEhrRepo: jest.fn()
}));

describe('EHRRequestCompleted', () => {
  it('should return "Electronic Healthcare Record Request Completed (GP2GP v1.1)" when calling name', () => {
    expect(new EHRRequestCompleted().name).toBe(
      'Electronic Healthcare Record Request Completed (GP2GP v1.1)'
    );
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

    it('should call extractNhsNumber', async done => {
      const message = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';
      await new EHRRequestCompleted().handleMessage(message);
      expect(extractNhsNumber).toHaveBeenCalledTimes(1);
      expect(extractNhsNumber).toHaveBeenCalledWith('another-message');
      done();
    });

    it('should call storeMessageInEhrRepo', async done => {
      const message = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';
      await new EHRRequestCompleted().handleMessage(message);
      expect(storeMessageInEhrRepo).toHaveBeenCalledTimes(1);
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        message,
        expect.objectContaining({ info: 'soap-information', nhsNumber: '1234567890' })
      );
      done();
    });

    it('should call storeMessageInEhrRepo without nhsNumber if not extracted', async done => {
      extractNhsNumber.mockRejectedValue('no NHS number found');
      const message = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';
      await new EHRRequestCompleted().handleMessage(message);
      expect(storeMessageInEhrRepo).toHaveBeenCalledTimes(1);
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        message,
        expect.not.objectContaining({
          nhsNumber: '1234567890'
        })
      );
      done();
    });
  });
});
